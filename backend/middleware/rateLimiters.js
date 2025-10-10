import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Chat messages rate limiter
export const chatMessageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // limit each IP to 60 messages per minute
    message: 'Too many messages sent. Please wait a minute before sending more messages.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Recent chats and conversations rate limiter
export const chatInfoLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // increased limit to 300 requests per minute
    message: 'Too many requests. Please try again after a minute.',
    standardHeaders: true,
    legacyHeaders: false,
});

export default {
    apiLimiter,
    chatMessageLimiter,
    chatInfoLimiter
};