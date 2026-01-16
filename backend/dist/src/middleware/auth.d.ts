import { Request, Response, NextFunction } from 'express';
import { ProviderType } from '../services/apiKeyManager';
export interface AuthRequest extends Request {
    userId?: string;
    user?: any;
    validatedApiKeys?: Array<{
        key: string;
        provider: ProviderType;
    }>;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map