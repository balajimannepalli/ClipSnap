import express from 'express';
import bcrypt from 'bcrypt';
import Clip from '../models/Clip.js';
import { generateClipboardId, generateCreatorToken } from '../utils/idGenerator.js';
import { createLimiter, editLimiter, readLimiter } from '../middleware/rateLimiter.js';
import { validateSize, validateTextOnly } from '../middleware/validateSize.js';

const router = express.Router();
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

/**
 * POST /api/clip
 * Create a new clip
 * Body: { content: string }
 * Returns: { clipboardId, creatorToken, url }
 */
router.post('/', createLimiter, validateSize, validateTextOnly, async (req, res) => {
    try {
        const { content = '' } = req.body;

        // Generate unique clipboard ID
        const clipboardId = await generateClipboardId();

        // Generate secure creator token
        const creatorToken = generateCreatorToken();

        // Hash the creator token for storage
        const creatorTokenHash = await bcrypt.hash(creatorToken, BCRYPT_ROUNDS);

        // Create new clip
        const clip = new Clip({
            clipboardId,
            content,
            creatorTokenHash,
            lastUpdated: new Date(),
            createdAt: new Date()
        });

        await clip.save();

        // Return response with one-time creator token
        res.status(201).json({
            clipboardId,
            creatorToken, // One-time response - client must store this
            url: `${FRONTEND_ORIGIN}/clip/${clipboardId}`,
            message: 'Clip created successfully. Store your creator token - it cannot be recovered.'
        });

    } catch (error) {
        console.error('Error creating clip:', error);
        res.status(500).json({
            error: 'Failed to create clip',
            code: 'CREATE_ERROR'
        });
    }
});

/**
 * GET /api/clip/:clipboardId
 * Get clip content (TTL is fixed from creation, not reset on access)
 * Returns: { clipboardId, content, lastUpdated, createdAt }
 */
router.get('/:clipboardId', readLimiter, async (req, res) => {
    try {
        const { clipboardId } = req.params;

        // Find clip (no TTL reset - expires 15 min after creation)
        const clip = await Clip.getClip(clipboardId);

        if (!clip) {
            return res.status(404).json({
                error: 'Clip not found or expired',
                code: 'NOT_FOUND'
            });
        }

        res.json({
            clipboardId: clip.clipboardId,
            content: clip.content,
            lastUpdated: clip.lastUpdated,
            createdAt: clip.createdAt,
            meta: clip.meta
        });

    } catch (error) {
        console.error('Error fetching clip:', error);
        res.status(500).json({
            error: 'Failed to fetch clip',
            code: 'FETCH_ERROR'
        });
    }
});

/**
 * GET /api/clip/:clipboardId/meta
 * Get clip metadata without content
 * Returns: { clipboardId, sizeBytes, lastUpdated }
 */
router.get('/:clipboardId/meta', readLimiter, async (req, res) => {
    try {
        const { clipboardId } = req.params;

        const clip = await Clip.findOne(
            { clipboardId },
            { clipboardId: 1, meta: 1, lastUpdated: 1, createdAt: 1 }
        ).lean();

        if (!clip) {
            return res.status(404).json({
                error: 'Clip not found or expired',
                code: 'NOT_FOUND'
            });
        }

        res.json({
            clipboardId: clip.clipboardId,
            sizeBytes: clip.meta?.sizeBytes || 0,
            lastUpdated: clip.lastUpdated,
            createdAt: clip.createdAt
        });

    } catch (error) {
        console.error('Error fetching clip meta:', error);
        res.status(500).json({
            error: 'Failed to fetch clip metadata',
            code: 'FETCH_ERROR'
        });
    }
});

/**
 * POST /api/clip/:clipboardId/edit
 * Edit clip content (fallback to socket)
 * Headers/Body: creatorToken required
 * Body: { content: string, creatorToken?: string }
 */
router.post('/:clipboardId/edit', editLimiter, validateSize, validateTextOnly, async (req, res) => {
    try {
        const { clipboardId } = req.params;
        const { content } = req.body;

        // Get token from header or body
        const creatorToken = req.headers.authorization?.replace('Bearer ', '') || req.body.creatorToken;

        if (!creatorToken) {
            return res.status(401).json({
                error: 'Creator token required',
                code: 'UNAUTHORIZED'
            });
        }

        if (content === undefined || content === null) {
            return res.status(400).json({
                error: 'Content is required',
                code: 'MISSING_CONTENT'
            });
        }

        // Find the clip
        const clip = await Clip.findOne({ clipboardId });

        if (!clip) {
            return res.status(404).json({
                error: 'Clip not found or expired',
                code: 'NOT_FOUND'
            });
        }

        // Verify creator token
        const isValidToken = await bcrypt.compare(creatorToken, clip.creatorTokenHash);

        if (!isValidToken) {
            return res.status(403).json({
                error: 'Invalid creator token. Only the creator can edit this clip.',
                code: 'FORBIDDEN'
            });
        }

        // Update content and reset TTL
        const updatedClip = await Clip.updateContent(clipboardId, content);

        res.json({
            clipboardId: updatedClip.clipboardId,
            content: updatedClip.content,
            lastUpdated: updatedClip.lastUpdated,
            meta: updatedClip.meta
        });

    } catch (error) {
        console.error('Error editing clip:', error);
        res.status(500).json({
            error: 'Failed to edit clip',
            code: 'EDIT_ERROR'
        });
    }
});

export default router;
