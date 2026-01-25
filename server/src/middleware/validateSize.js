const MAX_SIZE_BYTES = 100 * 1024; // 100 KB

/**
 * Middleware to validate content size
 * Rejects payloads larger than 100KB
 */
export function validateSize(req, res, next) {
    const content = req.body?.content;

    if (content === undefined || content === null) {
        return next();
    }

    if (typeof content !== 'string') {
        return res.status(400).json({
            error: 'Content must be text only',
            code: 'INVALID_CONTENT_TYPE'
        });
    }

    const sizeBytes = Buffer.byteLength(content, 'utf8');

    if (sizeBytes > MAX_SIZE_BYTES) {
        return res.status(413).json({
            error: 'Content too large. Maximum size is 100KB.',
            code: 'PAYLOAD_TOO_LARGE',
            maxSize: MAX_SIZE_BYTES,
            actualSize: sizeBytes
        });
    }

    // Attach size to request for later use
    req.contentSizeBytes = sizeBytes;
    next();
}

/**
 * Validate that content is text-only (no binary/special chars indicating files)
 */
export function validateTextOnly(req, res, next) {
    const content = req.body?.content;

    if (!content) {
        return next();
    }

    // Check for common binary file signatures
    const binarySignatures = [
        '\x89PNG',
        '\xFF\xD8\xFF',
        'GIF87a',
        'GIF89a',
        '%PDF',
        'PK\x03\x04'
    ];

    for (const sig of binarySignatures) {
        if (content.startsWith(sig)) {
            return res.status(400).json({
                error: 'Only text content is allowed. Images and files are not supported.',
                code: 'BINARY_NOT_ALLOWED'
            });
        }
    }

    next();
}

export const MAX_CONTENT_SIZE = MAX_SIZE_BYTES;
