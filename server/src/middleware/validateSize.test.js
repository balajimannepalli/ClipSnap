import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateSize, validateTextOnly, MAX_CONTENT_SIZE } from './validateSize.js';

// Mock request/response
function mockReq(body) {
    return { body };
}

function mockRes() {
    const res = {
        statusCode: 200,
        data: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.data = data;
            return this;
        }
    };
    return res;
}

describe('Validate Size Middleware', () => {
    describe('validateSize', () => {
        it('should pass content under limit', () => {
            const req = mockReq({ content: 'Hello, world!' });
            const res = mockRes();
            let nextCalled = false;

            validateSize(req, res, () => { nextCalled = true; });

            assert.strictEqual(nextCalled, true, 'next() should be called');
            assert.strictEqual(req.contentSizeBytes, 13, 'Size should be calculated');
        });

        it('should reject content over 100KB', () => {
            const largeContent = 'x'.repeat(MAX_CONTENT_SIZE + 1);
            const req = mockReq({ content: largeContent });
            const res = mockRes();
            let nextCalled = false;

            validateSize(req, res, () => { nextCalled = true; });

            assert.strictEqual(nextCalled, false, 'next() should not be called');
            assert.strictEqual(res.statusCode, 413, 'Should return 413');
            assert.strictEqual(res.data.code, 'PAYLOAD_TOO_LARGE');
        });

        it('should reject non-string content', () => {
            const req = mockReq({ content: { html: '<script>' } });
            const res = mockRes();
            let nextCalled = false;

            validateSize(req, res, () => { nextCalled = true; });

            assert.strictEqual(nextCalled, false, 'next() should not be called');
            assert.strictEqual(res.statusCode, 400, 'Should return 400');
        });

        it('should pass missing content', () => {
            const req = mockReq({});
            const res = mockRes();
            let nextCalled = false;

            validateSize(req, res, () => { nextCalled = true; });

            assert.strictEqual(nextCalled, true, 'next() should be called for missing content');
        });
    });

    describe('validateTextOnly', () => {
        it('should pass plain text', () => {
            const req = mockReq({ content: 'Hello, this is plain text!' });
            const res = mockRes();
            let nextCalled = false;

            validateTextOnly(req, res, () => { nextCalled = true; });

            assert.strictEqual(nextCalled, true, 'next() should be called');
        });

        it('should reject PNG signature', () => {
            const req = mockReq({ content: '\x89PNG\r\n\x1a\n...' });
            const res = mockRes();
            let nextCalled = false;

            validateTextOnly(req, res, () => { nextCalled = true; });

            assert.strictEqual(nextCalled, false, 'next() should not be called');
            assert.strictEqual(res.data.code, 'BINARY_NOT_ALLOWED');
        });

        it('should reject PDF signature', () => {
            const req = mockReq({ content: '%PDF-1.4...' });
            const res = mockRes();
            let nextCalled = false;

            validateTextOnly(req, res, () => { nextCalled = true; });

            assert.strictEqual(nextCalled, false, 'next() should not be called');
        });
    });
});
