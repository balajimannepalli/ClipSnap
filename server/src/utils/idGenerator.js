import crypto from 'crypto';
import Clip from '../models/Clip.js';

/**
 * Generate 4-digit numeric clipboard ID with collision handling
 * @returns {Promise<string>} Unique 4-digit clipboard ID
 */
export async function generateClipboardId() {
    const maxAttempts = 50;

    for (let i = 0; i < maxAttempts; i++) {
        // Generate random 4-digit number (1000-9999)
        const id = String(Math.floor(1000 + Math.random() * 9000));
        const existing = await Clip.findOne({ clipboardId: id }).lean();

        if (!existing) {
            return id;
        }
    }

    // Fallback: 5-digit if too many collisions
    const fallbackId = String(Math.floor(10000 + Math.random() * 90000));
    return fallbackId;
}

/**
 * Generate a secure creator token (32 bytes = 64 hex chars)
 * @returns {string} Secure random token
 */
export function generateCreatorToken() {
    return crypto.randomBytes(32).toString('hex');
}
