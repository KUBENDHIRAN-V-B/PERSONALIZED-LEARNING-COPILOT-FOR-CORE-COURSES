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
export type ProviderType = 'gemini' | 'groq' | 'cerebras' | 'openrouter' | 'unknown';
export interface ApiKeyEntry {
    id: string;
    provider: ProviderType;
    key: string;
    isValid: boolean;
    lastUsed: Date;
    failureCount: number;
    lastError?: string;
}
export interface ApiKeyValidationResult {
    isValid: boolean;
    provider: ProviderType;
    error?: string;
}
export declare function detectProvider(key: string): ProviderType;
export declare function validateApiKeyFormat(key: string): ApiKeyValidationResult;
declare class ApiKeyManager {
    private sessions;
    private readonly MAX_FAILURE_COUNT;
    private readonly SESSION_TIMEOUT_MS;
    initializeSession(sessionId: string, rawKeys: Array<{
        name: string;
        key: string;
    }>): {
        success: boolean;
        validKeys: number;
        errors: string[];
    };
    getAvailableKeys(sessionId: string): ApiKeyEntry[];
    getDecryptedKey(sessionId: string, keyId: string): string | null;
    markKeyFailure(sessionId: string, keyId: string, error: string): void;
    markKeySuccess(sessionId: string, keyId: string): void;
    clearSession(sessionId: string): void;
    private cleanupExpiredSessions;
    getKeyByProvider(sessionId: string, provider: ProviderType): ApiKeyEntry | null;
}
export declare const apiKeyManager: ApiKeyManager;
export {};
//# sourceMappingURL=apiKeyManager.d.ts.map