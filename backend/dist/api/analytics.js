"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverless_http_1 = __importDefault(require("serverless-http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const analytics_1 = __importDefault(require("../src/routes/analytics"));
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp)
                return allowed.test(origin);
            return allowed === origin;
        });
        if (isAllowed)
            return callback(null, true);
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
// Connect to DB before handling requests
app.use(async (req, res, next) => {
    await connectDB();
    next();
});
// API Routes
app.use('/analytics', analytics_1.default);
// Export for Vercel
exports.default = (0, serverless_http_1.default)(app);
//# sourceMappingURL=analytics.js.map