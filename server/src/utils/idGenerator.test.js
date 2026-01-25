import { describe, it } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { customAlphabet } from 'nanoid';

// Test the generation logic directly without DB dependency
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generateId = customAlphabet(BASE62, 7);

function generateCreatorToken() {
    return crypto.randomBytes(32).toString('hex');
}

describe('ID Generator', () => {
    describe('generateClipboardId (logic only)', () => {
        it('should generate a string of 7 characters', () => {
            const id = generateId();
            assert.strictEqual(id.length, 7, `ID length should be 7, got ${id.length}`);
        });

        it('should generate alphanumeric characters only', () => {
            const id = generateId();
            assert.match(id, /^[a-zA-Z0-9]+$/, 'ID should be alphanumeric');
        });

        it('should generate unique IDs', () => {
            const ids = new Set();
            for (let i = 0; i < 100; i++) {
                ids.add(generateId());
            }
            assert.strictEqual(ids.size, 100, 'All 100 IDs should be unique');
        });
    });

    describe('generateCreatorToken', () => {
        it('should generate a 64-character hex string', () => {
            const token = generateCreatorToken();
            assert.strictEqual(token.length, 64, 'Token should be 64 characters');
        });

        it('should generate hex characters only', () => {
            const token = generateCreatorToken();
            assert.match(token, /^[a-f0-9]+$/, 'Token should be hex');
        });

        it('should generate unique tokens', () => {
            const tokens = new Set();
            for (let i = 0; i < 100; i++) {
                tokens.add(generateCreatorToken());
            }
            assert.strictEqual(tokens.size, 100, 'All 100 tokens should be unique');
        });

        it('should be bcrypt hashable and verifiable', async () => {
            const token = generateCreatorToken();
            const hash = await bcrypt.hash(token, 10);
            const isValid = await bcrypt.compare(token, hash);
            assert.strictEqual(isValid, true, 'Token should verify against its hash');
        });
    });
});
