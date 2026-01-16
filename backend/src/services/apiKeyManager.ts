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

import crypto from 'crypto';

export type ProviderType = 'gemini' | 'groq' | 'cerebras' | 'openrouter' | 'unknown';

export interface ApiKeyEntry {
  id: string;
  provider: ProviderType;
  key: string; // Encrypted in memory
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

// Provider-specific key format validators
const PROVIDER_PATTERNS: Record<ProviderType, RegExp> = {
  gemini: /^AIza[0-9A-Za-z_-]{35}$/,
  groq: /^gsk_[0-9A-Za-z]{32,}$/,
  cerebras: /^[0-9A-Za-z]{40,}$/,
  openrouter: /^sk-or-v1-[0-9A-Za-z]{32,}$/,
  unknown: /^.+$/, // Fallback for unknown providers
};

// Provider detection based on key format
export function detectProvider(key: string): ProviderType {
  const trimmed = key.trim();
  
  for (const [provider, pattern] of Object.entries(PROVIDER_PATTERNS)) {
    if (provider === 'unknown') continue;
    if (pattern.test(trimmed)) {
      return provider as ProviderType;
    }
  }
  
  return 'unknown';
}

// Validate API key format
export function validateApiKeyFormat(key: string): ApiKeyValidationResult {
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
function encryptKey(key: string, sessionId: string): string {
  const algorithm = 'aes-256-cbc';
  const secretKey = crypto.createHash('sha256').update(sessionId + process.env.SESSION_SECRET || 'default-secret').digest();
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decryptKey(encryptedKey: string, sessionId: string): string {
  try {
    const algorithm = 'aes-256-cbc';
    const secretKey = crypto.createHash('sha256').update(sessionId + process.env.SESSION_SECRET || 'default-secret').digest();
    const [ivHex, encrypted] = encryptedKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt API key');
  }
}

// Session-scoped API key storage
class ApiKeyManager {
  private sessions: Map<string, Map<string, ApiKeyEntry>> = new Map();
  private readonly MAX_FAILURE_COUNT = 3;
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  // Initialize session with API keys
  initializeSession(sessionId: string, rawKeys: Array<{ name: string; key: string }>): {
    success: boolean;
    validKeys: number;
    errors: string[];
  } {
    const errors: string[] = [];
    const keyMap = new Map<string, ApiKeyEntry>();
    const seenProviders = new Set<ProviderType>();

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
      const entry: ApiKeyEntry = {
        id: crypto.randomBytes(16).toString('hex'),
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
  getAvailableKeys(sessionId: string): ApiKeyEntry[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

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
  getDecryptedKey(sessionId: string, keyId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const entry = session.get(keyId);
    if (!entry || !entry.isValid || entry.failureCount >= this.MAX_FAILURE_COUNT) {
      return null;
    }

    try {
      return decryptKey(entry.key, sessionId);
    } catch (error) {
      this.markKeyFailure(sessionId, keyId, 'Decryption failed');
      return null;
    }
  }

  // Mark key as failed
  markKeyFailure(sessionId: string, keyId: string, error: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const entry = session.get(keyId);
    if (!entry) return;

    entry.failureCount++;
    entry.lastError = error;
    entry.lastUsed = new Date();

    if (entry.failureCount >= this.MAX_FAILURE_COUNT) {
      entry.isValid = false;
    }
  }

  // Mark key as successful
  markKeySuccess(sessionId: string, keyId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const entry = session.get(keyId);
    if (!entry) return;

    entry.failureCount = Math.max(0, entry.failureCount - 1); // Reduce failure count on success
    entry.lastUsed = new Date();
    entry.lastError = undefined;
  }

  // Clear session
  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // Cleanup expired sessions
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      // Check if session has any recent activity
      const hasRecentActivity = Array.from(session.values()).some(
        entry => now - entry.lastUsed.getTime() < this.SESSION_TIMEOUT_MS
      );

      if (!hasRecentActivity) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Get key by provider
  getKeyByProvider(sessionId: string, provider: ProviderType): ApiKeyEntry | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    for (const entry of session.values()) {
      if (entry.provider === provider && entry.isValid && entry.failureCount < this.MAX_FAILURE_COUNT) {
        return entry;
      }
    }

    return null;
  }
}

// Singleton instance
export const apiKeyManager = new ApiKeyManager();
