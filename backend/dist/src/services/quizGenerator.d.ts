/**
 * AI Quiz Generation Service
 *
 * Secure, provider-agnostic quiz generation using user-provided API keys.
 * Features:
 * - Dynamic prompt construction
 * - Multi-provider support with failover
 * - Comprehensive error handling
 * - Rate limiting and security
 * - JSON schema validation
 */
import { ProviderType } from './apiKeyManager';
export interface QuizGenerationRequest {
    subject: string;
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    count: number;
    apiKeys: Array<{
        key: string;
        provider: ProviderType;
    }>;
    preferredProvider?: ProviderType;
}
export interface QuizQuestion {
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
}
export interface QuizGenerationResponse {
    questions: QuizQuestion[];
    provider: ProviderType;
    generationTime: number;
    success: boolean;
}
export interface QuizGenerationError {
    success: false;
    error: string;
    code: string;
    retryable: boolean;
    suggestedProvider?: ProviderType;
}
/**
 * Generate quiz questions using AI with provider failover
 */
export declare function generateQuizQuestions(request: QuizGenerationRequest, userId: string): Promise<QuizGenerationResponse | QuizGenerationError>;
//# sourceMappingURL=quizGenerator.d.ts.map