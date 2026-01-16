/**
 * Input Validation Middleware
 * 
 * Validates chat request inputs to prevent:
 * - Injection attacks
 * - Extremely long messages
 * - Malformed data
 * - XSS attempts
 */

import { Request, Response, NextFunction } from 'express';
import { ProviderType } from '../services/apiKeyManager';

export interface ValidatedChatRequest extends Request {
  validatedMessage?: string;
  validatedCourseId?: string;
  validatedApiKeys?: Array<{ key: string; provider: ProviderType }>;
}

// Sanitize and validate message
export function validateMessage(message: any): { valid: boolean; sanitized?: string; error?: string } {
  if (!message) {
    return { valid: false, error: 'Message is required' };
  }

  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > 10000) {
    return { valid: false, error: 'Message is too long (max 10,000 characters)' };
  }

  // Basic XSS prevention (remove script tags and dangerous patterns)
  const sanitized = trimmed
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return { valid: true, sanitized };
}

// Validate course ID
export function validateCourseId(courseId: any): { valid: boolean; sanitized?: string; error?: string } {
  if (!courseId) {
    return { valid: false, error: 'Course ID is required' };
  }

  if (typeof courseId !== 'string') {
    return { valid: false, error: 'Course ID must be a string' };
  }

  const sanitized = courseId.toLowerCase().trim();

  if (sanitized.length === 0) {
    return { valid: false, error: 'Course ID cannot be empty' };
  }

  if (sanitized.length > 100) {
    return { valid: false, error: 'Course ID is too long' };
  }

  // Only allow alphanumeric, hyphens, and underscores
  if (!/^[a-z0-9_-]+$/.test(sanitized)) {
    return { valid: false, error: 'Invalid course ID format' };
  }

  return { valid: true, sanitized };
}

// Validate API keys array for runtime use
export function validateApiKeysRuntime(apiKeys: any): { valid: boolean; keys?: Array<{ key: string; provider: ProviderType }>; error?: string } {
  if (!apiKeys) {
    return { valid: false, error: 'API keys are required' };
  }

  if (!Array.isArray(apiKeys)) {
    return { valid: false, error: 'API keys must be an array' };
  }

  if (apiKeys.length === 0) {
    return { valid: false, error: 'At least one API key is required' };
  }

  if (apiKeys.length > 10) {
    return { valid: false, error: 'Maximum 10 API keys allowed' };
  }

  const keys: Array<{ key: string; provider: ProviderType }> = [];
  const seenProviders = new Set<ProviderType>();

  for (const item of apiKeys) {
    if (typeof item !== 'object' || item === null) {
      return { valid: false, error: 'Each API key entry must be an object' };
    }

    const { key, provider } = item;

    if (typeof key !== 'string' || typeof provider !== 'string') {
      return { valid: false, error: 'Each API key entry must have string key and provider fields' };
    }

    const trimmedKey = key.trim();
    if (trimmedKey.length === 0) {
      continue; // Skip empty keys
    }

    // Validate provider type
    const validProviders: ProviderType[] = ['gemini', 'groq', 'cerebras', 'openrouter'];
    if (!validProviders.includes(provider as ProviderType)) {
      return { valid: false, error: `Invalid provider: ${provider}. Supported providers: ${validProviders.join(', ')}` };
    }

    // Check for duplicate providers (optional - allow multiple keys per provider)
    if (seenProviders.has(provider as ProviderType)) {
      // Allow multiple keys per provider for fallback
    }

    seenProviders.add(provider as ProviderType);
    keys.push({ key: trimmedKey, provider: provider as ProviderType });
  }

  if (keys.length === 0) {
    return { valid: false, error: 'No valid API keys provided' };
  }

  return { valid: true, keys };
}

// Chat request validation middleware
export function validateChatRequest(req: ValidatedChatRequest, res: Response, next: NextFunction) {
  try {
    const { message, courseId, apiKeys } = req.body;

    // Validate message
    const messageValidation = validateMessage(message);
    if (!messageValidation.valid) {
      return res.status(400).json({ error: messageValidation.error });
    }
    req.validatedMessage = messageValidation.sanitized;

    // Validate course ID
    const courseValidation = validateCourseId(courseId);
    if (!courseValidation.valid) {
      return res.status(400).json({ error: courseValidation.error });
    }
    req.validatedCourseId = courseValidation.sanitized;

    // Validate API keys for runtime use
    const keysValidation = validateApiKeysRuntime(apiKeys);
    if (!keysValidation.valid) {
      return res.status(400).json({ error: keysValidation.error });
    }
    req.validatedApiKeys = keysValidation.keys;

    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(400).json({ error: 'Invalid request format' });
  }
}
