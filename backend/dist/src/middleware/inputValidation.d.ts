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
    validatedApiKeys?: Array<{
        key: string;
        provider: ProviderType;
    }>;
}
export declare function validateMessage(message: any): {
    valid: boolean;
    sanitized?: string;
    error?: string;
};
export declare function validateCourseId(courseId: any): {
    valid: boolean;
    sanitized?: string;
    error?: string;
};
export declare function validateApiKeysRuntime(apiKeys: any): {
    valid: boolean;
    keys?: Array<{
        key: string;
        provider: ProviderType;
    }>;
    error?: string;
};
export declare function validateChatRequest(req: ValidatedChatRequest, res: Response, next: NextFunction): Response<any, Record<string, any>>;
//# sourceMappingURL=inputValidation.d.ts.map