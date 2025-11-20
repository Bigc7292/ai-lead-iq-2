const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse
 */

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: {
            message: 'Too many requests from this IP, please try again later',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: '15 minutes'
        }
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * Strict limiter for expensive operations (e.g., lead creation)
 * 50 requests per 15 minutes
 */
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: {
        error: {
            message: 'Too many requests, please slow down',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: '15 minutes'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Very strict limiter for batch operations
 * 10 requests per hour
 */
const batchLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per hour
    message: {
        error: {
            message: 'Too many batch requests, please try again later',
            code: 'BATCH_RATE_LIMIT_EXCEEDED',
            retryAfter: '1 hour'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count all requests, even successful ones
});

/**
 * Auth endpoint limiter (for login/registration)
 * Prevents brute force attacks
 * 5 requests per 15 minutes
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts
    message: {
        error: {
            message: 'Too many authentication attempts, please try again later',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            retryAfter: '15 minutes'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

module.exports = {
    generalLimiter,
    strictLimiter,
    batchLimiter,
    authLimiter
};
