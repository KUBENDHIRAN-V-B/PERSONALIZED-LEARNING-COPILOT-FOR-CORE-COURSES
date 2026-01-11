"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Import routes
const auth_1 = __importDefault(require("../src/routes/auth"));
const chat_1 = __importDefault(require("../src/routes/chat"));
const learning_1 = __importDefault(require("../src/routes/learning"));
const analytics_1 = __importDefault(require("../src/routes/analytics"));
const courses_1 = __importDefault(require("../src/routes/courses"));
// Import middleware
const errorHandler_1 = require("../src/middleware/errorHandler");
const auth_2 = require("../src/middleware/auth");
// Load environment variables
dotenv_1.default.config();
// MongoDB connection (cached for serverless)
let isConnected = false;
const connectDB = async () => {
    if (isConnected)
        return;
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (mongoUri && mongoUri !== 'mongodb://localhost:27017/learning_copilot') {
            await mongoose_1.default.connect(mongoUri);
            isConnected = true;
            console.log('📦 MongoDB connected successfully');
        }
        else {
            console.log('⚠️ MongoDB not configured. Using in-memory storage.');
        }
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
};
const app = (0, express_1.default)();
// CORS configuration for production
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://personalized-learning-copilot-for-core-courses.vercel.app',
    /\.vercel\.app$/,
    /\.netlify\.app$/,
];
// Performance middleware
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        // Check if origin matches any allowed origin or pattern
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp)
                return allowed.test(origin);
            return allowed === origin;
        });
        if (isAllowed)
            return callback(null, true);
        // In development, allow all
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Connect to DB before handling requests
app.use(async (req, res, next) => {
    await connectDB();
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: 'netlify-serverless',
    });
});
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Personalized Learning Copilot API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            status: '/api/status',
            auth: '/api/auth',
            chat: '/api/chat',
            learning: '/api/learning',
            analytics: '/api/analytics',
            courses: '/api/courses',
        }
    });
});
// API Status check endpoint
app.get('/api/status', async (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        status: 'online',
        message: 'Backend is running. API keys must be provided by users.',
        server: {
            environment: 'serverless'
        }
    });
});
// Create a mock io object for chat routes (WebSocket not supported in serverless)
const mockIo = {
    to: () => ({ emit: () => { } }),
    emit: () => { },
};
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/chat', auth_2.authMiddleware, (0, chat_1.default)(mockIo));
app.use('/api/learning', auth_2.authMiddleware, learning_1.default);
app.use('/api/analytics', auth_2.authMiddleware, analytics_1.default);
app.use('/api/courses', auth_2.authMiddleware, courses_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found', path: req.path });
});
// Export for Vercel
exports.default = app;
//# sourceMappingURL=index.js.map