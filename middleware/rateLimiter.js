const rateLimit = require('express-rate-limit');

// Auth endpoints rate limiter - 5 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login/register attempts, please try again later',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: (req) => process.env.NODE_ENV !== 'production', // Only rate limit in production
    validate: { xForwardedForHeader: false },
});

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV !== 'production'
});

module.exports = {
    authLimiter,
    apiLimiter
};
