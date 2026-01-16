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

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import axios, { AxiosError } from 'axios';
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
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  apiKey: string;
  provider: ProviderType;
  timeout?: number;
}

// Provider-specific error codes
export enum ProviderErrorCode {
  INVALID_KEY = 'INVALID_KEY',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNSUPPORTED_MODEL = 'UNSUPPORTED_MODEL',
  INVALID_REQUEST = 'INVALID_REQUEST',
  CONCURRENT_REQUEST = 'CONCURRENT_REQUEST',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Runtime key validation patterns (never stored, only used for validation)
const RUNTIME_KEY_PATTERNS: Record<ProviderType, RegExp> = {
  gemini: /^AIza[0-9A-Za-z_-]{35}$/,
  groq: /^gsk_[0-9A-Za-z]{32,}$/,
  cerebras: /^[0-9A-Za-z]{40,}$/,
  openrouter: /^sk-or-v1-[0-9A-Za-z]{32,}$/,
  unknown: /^.+$/,
};

// Validate API key format at runtime (no logging)
export function validateApiKeyRuntime(key: string, provider: ProviderType): boolean {
  if (!key || typeof key !== 'string') return false;

  const trimmed = key.trim();
  if (trimmed.length < 20 || trimmed.length > 500) return false;

  const pattern = RUNTIME_KEY_PATTERNS[provider];
  return pattern ? pattern.test(trimmed) : false;
}

// Sanitize AI responses to prevent XSS and malicious content
function sanitizeResponse(content: string): string {
  return content
    // Remove script tags and dangerous patterns
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[SCRIPT REMOVED]')
    .replace(/javascript:/gi, '[JAVASCRIPT REMOVED]')
    .replace(/on\w+\s*=/gi, '[EVENT REMOVED]')
    // Remove data URLs that might contain malicious content
    .replace(/data:\s*[^;]+;base64,[a-zA-Z0-9+/]+=*/gi, '[DATA URL REMOVED]')
    // Limit consecutive newlines
    .replace(/\n{10,}/g, '\n\n\n')
    // Remove null bytes
    .replace(/\0/g, '')
    .trim();
}

// Detect error type from provider response
function detectErrorCode(error: any, provider: ProviderType): ProviderErrorCode {
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ProviderErrorCode.TIMEOUT;
  }

  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
    return ProviderErrorCode.NETWORK_ERROR;
  }

  const status = error.response?.status || error.status;
  const errorMessage = (error.response?.data?.error?.message || error.message || '').toLowerCase();

  if (status === 401 || status === 403 || errorMessage.includes('invalid') || errorMessage.includes('unauthorized')) {
    return ProviderErrorCode.INVALID_KEY;
  }

  if (status === 429 || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
    return ProviderErrorCode.QUOTA_EXCEEDED;
  }

  if (status === 400 || errorMessage.includes('model') || errorMessage.includes('not found')) {
    return ProviderErrorCode.INVALID_REQUEST;
  }

  if (status === 409 || errorMessage.includes('concurrent')) {
    return ProviderErrorCode.CONCURRENT_REQUEST;
  }

  return ProviderErrorCode.UNKNOWN_ERROR;
}

// Generate user-friendly error message
function getUserFriendlyError(errorCode: ProviderErrorCode, provider: ProviderType): string {
  switch (errorCode) {
    case ProviderErrorCode.INVALID_KEY:
      return `Invalid API key for ${provider}. Please verify your key is correct and try again.`;
    case ProviderErrorCode.QUOTA_EXCEEDED:
      return `Quota exceeded for ${provider}. Please check your usage limits or try another provider.`;
    case ProviderErrorCode.RATE_LIMIT:
      return `Rate limit reached for ${provider}. Please wait a moment before trying again.`;
    case ProviderErrorCode.TIMEOUT:
      return `Request timed out for ${provider}. Please try again.`;
    case ProviderErrorCode.NETWORK_ERROR:
      return `Network error connecting to ${provider}. Please check your internet connection.`;
    case ProviderErrorCode.UNSUPPORTED_MODEL:
      return `Unsupported model for ${provider}. Please check your configuration.`;
    case ProviderErrorCode.INVALID_REQUEST:
      return `Invalid request format for ${provider}. Please try rephrasing your question.`;
    case ProviderErrorCode.CONCURRENT_REQUEST:
      return `Too many concurrent requests to ${provider}. Please wait and try again.`;
    default:
      return `An error occurred with ${provider}. Please try again or use another provider.`;
  }
}

// Gemini Provider
async function callGeminiProvider(request: ProviderRequest): Promise<ProviderResponse> {
  const { message, systemPrompt, history, apiKey, provider, timeout = 30000 } = request;

  // Runtime key validation
  if (!validateApiKeyRuntime(apiKey, provider)) {
    return {
      success: false,
      content: null,
      provider: 'gemini',
      error: getUserFriendlyError(ProviderErrorCode.INVALID_KEY, 'gemini'),
      errorCode: ProviderErrorCode.INVALID_KEY,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    });

    const conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I will help you with your questions.' }] }
    ];

    // Add recent history (last 6 messages)
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      conversationHistory.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    conversationHistory.push({ role: 'user', parts: [{ text: message }] });

    const chat = model.startChat({ 
      history: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    const result = await Promise.race([
      chat.sendMessage(message),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]) as any;

    const content = result.response?.text();

    if (!content) {
      return {
        success: false,
        content: null,
        provider: 'gemini',
        error: 'Empty response from Gemini',
        errorCode: ProviderErrorCode.UNKNOWN_ERROR,
      };
    }

    const sanitizedContent = sanitizeResponse(content);

    return {
      success: true,
      content: sanitizedContent,
      provider: 'gemini',
      sanitized: sanitizedContent !== content,
    };
  } catch (error: any) {
    const errorCode = detectErrorCode(error, 'gemini');
    return {
      success: false,
      content: null,
      provider: 'gemini',
      error: getUserFriendlyError(errorCode, 'gemini'),
      errorCode,
    };
  }
}

// Groq Provider
async function callGroqProvider(request: ProviderRequest): Promise<ProviderResponse> {
  const { message, systemPrompt, history, apiKey, provider, timeout = 30000 } = request;

  // Runtime key validation
  if (!validateApiKeyRuntime(apiKey, provider)) {
    return {
      success: false,
      content: null,
      provider: 'groq',
      error: getUserFriendlyError(ProviderErrorCode.INVALID_KEY, 'groq'),
      errorCode: ProviderErrorCode.INVALID_KEY,
    };
  }

  try {
    const groqClient = new Groq({ apiKey });

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    messages.push({ role: 'user', content: message });

    const completion = await Promise.race([
      groqClient.chat.completions.create({
        messages,
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 2048,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]) as any;

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        content: null,
        provider: 'groq',
        error: 'Empty response from Groq',
        errorCode: ProviderErrorCode.UNKNOWN_ERROR,
      };
    }

    const sanitizedContent = sanitizeResponse(content);

    return {
      success: true,
      content: sanitizedContent,
      provider: 'groq',
      sanitized: sanitizedContent !== content,
    };
  } catch (error: any) {
    const errorCode = detectErrorCode(error, 'groq');
    return {
      success: false,
      content: null,
      provider: 'groq',
      error: getUserFriendlyError(errorCode, 'groq'),
      errorCode,
    };
  }
}

// Cerebras Provider
async function callCerebrasProvider(request: ProviderRequest): Promise<ProviderResponse> {
  const { message, systemPrompt, history, apiKey, provider, timeout = 30000 } = request;

  // Runtime key validation
  if (!validateApiKeyRuntime(apiKey, provider)) {
    return {
      success: false,
      content: null,
      provider: 'cerebras',
      error: getUserFriendlyError(ProviderErrorCode.INVALID_KEY, 'cerebras'),
      errorCode: ProviderErrorCode.INVALID_KEY,
    };
  }

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    messages.push({ role: 'user', content: message });

    const response = await Promise.race([
      axios.post(
        'https://api.cerebras.ai/v1/chat/completions',
        {
          messages,
          model: 'llama3.1-8b',
          temperature: 0.7,
          max_tokens: 2048,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout,
        }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]) as any;

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        content: null,
        provider: 'cerebras',
        error: 'Empty response from Cerebras',
        errorCode: ProviderErrorCode.UNKNOWN_ERROR,
      };
    }

    const sanitizedContent = sanitizeResponse(content);

    return {
      success: true,
      content: sanitizedContent,
      provider: 'cerebras',
      sanitized: sanitizedContent !== content,
    };
  } catch (error: any) {
    const errorCode = detectErrorCode(error, 'cerebras');
    return {
      success: false,
      content: null,
      provider: 'cerebras',
      error: getUserFriendlyError(errorCode, 'cerebras'),
      errorCode,
    };
  }
}

// OpenRouter Provider
async function callOpenRouterProvider(request: ProviderRequest): Promise<ProviderResponse> {
  const { message, systemPrompt, history, apiKey, provider, timeout = 30000 } = request;

  // Runtime key validation
  if (!validateApiKeyRuntime(apiKey, provider)) {
    return {
      success: false,
      content: null,
      provider: 'openrouter',
      error: getUserFriendlyError(ProviderErrorCode.INVALID_KEY, 'openrouter'),
      errorCode: ProviderErrorCode.INVALID_KEY,
    };
  }

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    messages.push({ role: 'user', content: message });

    const response = await Promise.race([
      axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          messages,
          model: 'anthropic/claude-3-haiku',
          temperature: 0.7,
          max_tokens: 2048,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
            'X-Title': 'Personalized Learning Copilot',
          },
          timeout,
        }
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]) as any;

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        content: null,
        provider: 'openrouter',
        error: 'Empty response from OpenRouter',
        errorCode: ProviderErrorCode.UNKNOWN_ERROR,
      };
    }

    const sanitizedContent = sanitizeResponse(content);

    return {
      success: true,
      content: sanitizedContent,
      provider: 'openrouter',
      sanitized: sanitizedContent !== content,
    };
  } catch (error: any) {
    const errorCode = detectErrorCode(error, 'openrouter');
    return {
      success: false,
      content: null,
      provider: 'openrouter',
      error: getUserFriendlyError(errorCode, 'openrouter'),
      errorCode,
    };
  }
}

// Main provider call function with automatic fallback
export async function callAIProvider(
  request: ProviderRequest,
  availableKeys: Array<{ key: string; provider: ProviderType }>
): Promise<ProviderResponse> {
  // Validate all keys at runtime
  const validKeys = availableKeys.filter(({ key, provider }) =>
    validateApiKeyRuntime(key, provider)
  );

  if (validKeys.length === 0) {
    return {
      success: false,
      content: null,
      provider: 'unknown',
      error: 'No valid API keys provided. Please check your keys and try again.',
      errorCode: ProviderErrorCode.INVALID_KEY,
    };
  }

  // Provider priority order (can be customized)
  const providerOrder: ProviderType[] = ['gemini', 'groq', 'cerebras', 'openrouter'];

  // Group keys by provider
  const keysByProvider = new Map<ProviderType, string[]>();
  for (const { key, provider } of validKeys) {
    if (!keysByProvider.has(provider)) {
      keysByProvider.set(provider, []);
    }
    keysByProvider.get(provider)!.push(key);
  }

  // Try providers in priority order
  for (const provider of providerOrder) {
    const keys = keysByProvider.get(provider);
    if (!keys || keys.length === 0) continue;

    // Try each key for this provider
    for (const apiKey of keys) {
      let response: ProviderResponse;

      switch (provider) {
        case 'gemini':
          response = await callGeminiProvider({ ...request, apiKey, provider });
          break;
        case 'groq':
          response = await callGroqProvider({ ...request, apiKey, provider });
          break;
        case 'cerebras':
          response = await callCerebrasProvider({ ...request, apiKey, provider });
          break;
        case 'openrouter':
          response = await callOpenRouterProvider({ ...request, apiKey, provider });
          break;
        default:
          continue;
      }

      // If successful, return immediately
      if (response.success) {
        return response;
      }

      // If it's a permanent error (invalid key), skip to next provider
      if (response.errorCode === ProviderErrorCode.INVALID_KEY) {
        break; // Try next provider
      }

      // For temporary errors (rate limit, timeout), try next key
      continue;
    }
  }

  // All providers failed
  return {
    success: false,
    content: null,
    provider: 'unknown',
    error: 'All AI providers failed. Please check your API keys and try again.',
    errorCode: ProviderErrorCode.UNKNOWN_ERROR,
  };
}
