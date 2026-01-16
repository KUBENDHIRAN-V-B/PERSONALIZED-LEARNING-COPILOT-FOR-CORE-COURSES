/**
 * Security Middleware
 *
 * Enforces security policies:
 * - HTTPS enforcement (production)
 * - No logging of sensitive data
 * - Request size limits
 */
import { Request, Response, NextFunction } from 'express';
export declare function enforceHTTPS(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>>;
export declare function sanitizeForLogging(data: any): any;
export declare function limitRequestSize(maxSize?: number): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=security.d.ts.map