import { describe, it } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Test the generation logic directly without DB dependency
// Using crypto.randomInt to match actual implementation
function generateId() {
    return String(crypto.randomInt(1000, 10000));
}

function generateCreatorToken() {
    return crypto.randomBytes(32).toString('hex');
}

describe('ID Generator', () => {
    describe('generateClipboardId (logic only)', () => {
        it('should generate a 4-digit numeric string', () => {
            const id = generateId();
            assert.strictEqual(id.length, 4, `ID length should be 4, got ${id.length}`);
        });

        it('should generate numeric characters only', () => {
            const id = generateId();
            assert.match(id, /^[0-9]+$/, 'ID should be numeric');
        });

        it('should generate IDs in valid range (1000-9999)', () => {
            for (let i = 0; i < 100; i++) {
                const id = parseInt(generateId(), 10);
                assert.ok(id >= 1000 && id <= 9999, `ID ${id} should be in range 1000-9999`);
            }
        });

        it('should generate unique IDs (high probability)', () => {
            const ids = new Set();
            for (let i = 0; i < 100; i++) {
                ids.add(generateId());
            }
            // With 9000 possible values, 100 samples should have very few collisions
            assert.ok(ids.size >= 90, `Expected at least 90 unique IDs, got ${ids.size}`);
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
