import crypto from 'crypto';
import Clip from '../models/Clip.js';

/**
 * Generate 4-digit numeric clipboard ID with collision handling
 * Uses crypto.randomInt() for cryptographically secure randomness
 * @returns {Promise<string>} Unique 4-5 digit clipboard ID
 */
export async function generateClipboardId() {
    const maxAttempts = 50;

    for (let i = 0; i < maxAttempts; i++) {
        // Generate cryptographically secure random 4-digit number (1000-9999)
        const id = String(crypto.randomInt(1000, 10000));
        const existing = await Clip.findOne({ clipboardId: id }).lean();

        if (!existing) {
            return id;
        }
    }

    // Fallback: 5-digit if too many collisions (also check uniqueness)
    const fallbackId = String(crypto.randomInt(10000, 100000));
    const fallbackExists = await Clip.findOne({ clipboardId: fallbackId }).lean();

    if (!fallbackExists) {
        return fallbackId;
    }

    // If even fallback collides, throw error (extremely rare)
    throw new Error('Unable to generate unique clipboard ID - please try again');
}

/**
 * Generate a secure creator token (32 bytes = 64 hex chars)
 * @returns {string} Secure random token
 */
export function generateCreatorToken() {
    return crypto.randomBytes(32).toString('hex');
}
