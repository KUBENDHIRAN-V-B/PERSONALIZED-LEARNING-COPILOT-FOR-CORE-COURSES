"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            // For development - use a default user ID
            req.userId = 'demo-user';
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        // For development - use a default user ID
        req.userId = 'demo-user';
        next();
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map