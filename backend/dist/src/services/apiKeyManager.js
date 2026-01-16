"use strict";
/**
 * Secure API Key Manager Service
 *
 * Handles runtime API key management with:
 * - Format validation per provider
 * - Secure in-memory storage (session-scoped)
 * - Automatic key rotation and fallback
 * - Provider detection
 * - No logging of sensitive data
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyManager = void 0;
exports.detectProvider = detectProvider;
exports.validateApiKeyFormat = validateApiKeyFormat;
const crypto_1 = __importDefault(require("crypto"));
// Provider-specific key format validators
const PROVIDER_PATTERNS = {
    gemini: /^AIza[0-9A-Za-z_-]{35}$/,
    groq: /^gsk_[0-9A-Za-z]{32,}$/,
    cerebras: /^[0-9A-Za-z]{40,}$/,
    openrouter: /^sk-or-v1-[0-9A-Za-z]{32,}$/,
    unknown: /^.+$/, // Fallback for unknown providers
};
// Provider detection based on key format
function detectProvider(key) {
    const trimmed = key.trim();
    for (const [provider, pattern] of Object.entries(PROVIDER_PATTERNS)) {
        if (provider === 'unknown')
            continue;
        if (pattern.test(trimmed)) {
            return provider;
        }
    }
    return 'unknown';
}
// Validate API key format
function validateApiKeyFormat(key) {
    if (!key || typeof key !== 'string') {
        return { isValid: false, provider: 'unknown', error: 'API key must be a non-empty string' };
    }
    const trimmed = key.trim();
    if (trimmed.length < 20) {
        return { isValid: false, provider: 'unknown', error: 'API key is too short' };
    }
    if (trimmed.length > 500) {
        return { isValid: false, provider: 'unknown', error: 'API key is too long' };
    }
    const provider = detectProvider(trimmed);
    if (provider === 'unknown') {
        // Allow unknown providers but warn
        return { isValid: true, provider: 'unknown', error: 'Provider could not be detected. Ensure key format is correct.' };
    }
    return { isValid: true, provider };
}
// Simple in-memory encryption (for session storage only)
function encryptKey(key, sessionId) {
    const algorithm = 'aes-256-cbc';
    const secretKey = crypto_1.default.createHash('sha256').update(sessionId + process.env.SESSION_SECRET || 'default-secret').digest();
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(key, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}
function decryptKey(encryptedKey, sessionId) {
    try {
        const algorithm = 'aes-256-cbc';
        const secretKey = crypto_1.default.createHash('sha256').update(sessionId + process.env.SESSION_SECRET || 'default-secret').digest();
        const [ivHex, encrypted] = encryptedKey.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto_1.default.createDecipheriv(algorithm, secretKey, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        throw new Error('Failed to decrypt API key');
    }
}
// Session-scoped API key storage
class ApiKeyManager {
    constructor() {
        this.sessions = new Map();
        this.MAX_FAILURE_COUNT = 3;
        this.SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    }
    // Initialize session with API keys
    initializeSession(sessionId, rawKeys) {
        const errors = [];
        const keyMap = new Map();
        const seenProviders = new Set();
        for (const { name, key } of rawKeys) {
            // Validate format
            const validation = validateApiKeyFormat(key);
            if (!validation.isValid) {
                errors.push(`${name}: ${validation.error}`);
                continue;
            }
            // Check for duplicate providers
            if (seenProviders.has(validation.provider) && validation.provider !== 'unknown') {
                errors.push(`${name}: Duplicate provider (${validation.provider}). Only one key per provider allowed.`);
                continue;
            }
            // Encrypt and store
            const entry = {
                id: crypto_1.default.randomBytes(16).toString('hex'),
                provider: validation.provider,
                key: encryptKey(key, sessionId),
                isValid: true,
                lastUsed: new Date(),
                failureCount: 0,
            };
            keyMap.set(entry.id, entry);
            seenProviders.add(validation.provider);
        }
        if (keyMap.size === 0) {
            return { success: false, validKeys: 0, errors };
        }
        this.sessions.set(sessionId, keyMap);
        // Cleanup old sessions
        this.cleanupExpiredSessions();
        return { success: true, validKeys: keyMap.size, errors };
    }
    // Get available keys for a session
    getAvailableKeys(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return [];
        return Array.from(session.values())
            .filter(entry => entry.isValid && entry.failureCount < this.MAX_FAILURE_COUNT)
            .sort((a, b) => {
            // Prefer keys with fewer failures and recent usage
            if (a.failureCount !== b.failureCount) {
                return a.failureCount - b.failureCount;
            }
            return b.lastUsed.getTime() - a.lastUsed.getTime();
        });
    }
    // Get decrypted key by ID
    getDecryptedKey(sessionId, keyId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return null;
        const entry = session.get(keyId);
        if (!entry || !entry.isValid || entry.failureCount >= this.MAX_FAILURE_COUNT) {
            return null;
        }
        try {
            return decryptKey(entry.key, sessionId);
        }
        catch (error) {
            this.markKeyFailure(sessionId, keyId, 'Decryption failed');
            return null;
        }
    }
    // Mark key as failed
    markKeyFailure(sessionId, keyId, error) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        const entry = session.get(keyId);
        if (!entry)
            return;
        entry.failureCount++;
        entry.lastError = error;
        entry.lastUsed = new Date();
        if (entry.failureCount >= this.MAX_FAILURE_COUNT) {
            entry.isValid = false;
        }
    }
    // Mark key as successful
    markKeySuccess(sessionId, keyId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        const entry = session.get(keyId);
        if (!entry)
            return;
        entry.failureCount = Math.max(0, entry.failureCount - 1); // Reduce failure count on success
        entry.lastUsed = new Date();
        entry.lastError = undefined;
    }
    // Clear session
    clearSession(sessionId) {
        this.sessions.delete(sessionId);
    }
    // Cleanup expired sessions
    cleanupExpiredSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            // Check if session has any recent activity
            const hasRecentActivity = Array.from(session.values()).some(entry => now - entry.lastUsed.getTime() < this.SESSION_TIMEOUT_MS);
            if (!hasRecentActivity) {
                this.sessions.delete(sessionId);
            }
        }
    }
    // Get key by provider
    getKeyByProvider(sessionId, provider) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return null;
        for (const entry of session.values()) {
            if (entry.provider === provider && entry.isValid && entry.failureCount < this.MAX_FAILURE_COUNT) {
                return entry;
            }
        }
        return null;
    }
}
// Singleton instance
exports.apiKeyManager = new ApiKeyManager();
//# sourceMappingURL=apiKeyManager.js.map