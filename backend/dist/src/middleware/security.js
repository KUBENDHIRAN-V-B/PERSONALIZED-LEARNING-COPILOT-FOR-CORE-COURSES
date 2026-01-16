"use strict";
/**
 * Security Middleware
 *
 * Enforces security policies:
 * - HTTPS enforcement (production)
 * - No logging of sensitive data
 * - Request size limits
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceHTTPS = enforceHTTPS;
exports.sanitizeForLogging = sanitizeForLogging;
exports.limitRequestSize = limitRequestSize;
// HTTPS enforcement middleware
function enforceHTTPS(req, res, next) {
    // Only enforce in production
    if (process.env.NODE_ENV === 'production') {
        // Check if request is secure (behind proxy)
        const isSecure = req.secure ||
            req.headers['x-forwarded-proto'] === 'https' ||
            req.headers['x-forwarded-ssl'] === 'on';
        if (!isSecure) {
            return res.status(403).json({
                error: 'HTTPS is required for API key operations',
                message: 'Please use HTTPS to access this endpoint'
            });
        }
    }
    next();
}
// Sanitize request body to remove sensitive data before logging
function sanitizeForLogging(data) {
    if (!data || typeof data !== 'object') {
        return data;
    }
    const sanitized = { ...data };
    // Remove API keys from any nested structure
    if (sanitized.apiKeys) {
        sanitized.apiKeys = '[REDACTED]';
    }
    if (sanitized.apiKey) {
        sanitized.apiKey = '[REDACTED]';
    }
    if (sanitized.key) {
        sanitized.key = '[REDACTED]';
    }
    // Recursively sanitize nested objects
    for (const key in sanitized) {
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeForLogging(sanitized[key]);
        }
    }
    return sanitized;
}
// Request size limit middleware
function limitRequestSize(maxSize = 1024 * 1024) {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0', 10);
        if (contentLength > maxSize) {
            return res.status(413).json({
                error: 'Request payload too large',
                maxSize: `${maxSize / 1024}KB`
            });
        }
        next();
    };
}
//# sourceMappingURL=security.js.map