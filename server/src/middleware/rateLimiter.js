import rateLimit from 'express-rate-limit';

const RATE_LIMIT_CREATE = parseInt(process.env.RATE_LIMIT_CREATE_PER_HOUR) || 30;
const RATE_LIMIT_EDIT = parseInt(process.env.RATE_LIMIT_EDIT_PER_MIN) || 60;

/**
 * Rate limiter for clip creation
 * Default: 30 requests per hour per IP
 */
export const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: RATE_LIMIT_CREATE,
    message: {
        error: 'Too many clips created. Please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip
});

/**
 * Rate limiter for clip edits
 * Default: 60 requests per minute per IP
 */
export const editLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: RATE_LIMIT_EDIT,
    message: {
        error: 'Too many edit requests. Please slow down.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip
});

/**
 * General API rate limiter
 * Default: 100 requests per minute per IP
 */
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
