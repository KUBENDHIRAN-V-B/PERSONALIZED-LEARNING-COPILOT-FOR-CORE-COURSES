/**
 * AI Provider Abstraction Layer
 *
 * Provides unified interface for multiple AI providers with:
 * - Automatic fallback
 * - Error handling
 * - Timeout management
 * - Rate limit awareness
 * - Runtime key validation
 * - Secure key handling (never logged or stored)
 */
import { ProviderType } from './apiKeyManager';
export interface ProviderResponse {
    success: boolean;
    content: string | null;
    provider: ProviderType;
    error?: string;
    errorCode?: string;
    sanitized?: boolean;
}
export interface ProviderRequest {
    message: string;
    systemPrompt: string;
    history: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
    apiKey: string;
    provider: ProviderType;
    timeout?: number;
}
export declare enum ProviderErrorCode {
    INVALID_KEY = "INVALID_KEY",
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
    RATE_LIMIT = "RATE_LIMIT",
    TIMEOUT = "TIMEOUT",
    NETWORK_ERROR = "NETWORK_ERROR",
    UNSUPPORTED_MODEL = "UNSUPPORTED_MODEL",
    INVALID_REQUEST = "INVALID_REQUEST",
    CONCURRENT_REQUEST = "CONCURRENT_REQUEST",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export declare function validateApiKeyRuntime(key: string, provider: ProviderType): boolean;
export declare function callAIProvider(request: ProviderRequest, availableKeys: Array<{
    key: string;
    provider: ProviderType;
}>): Promise<ProviderResponse>;
//# sourceMappingURL=aiProvider.d.ts.map