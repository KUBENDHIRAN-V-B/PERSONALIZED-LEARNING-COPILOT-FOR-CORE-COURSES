"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const chat_1 = __importDefault(require("./routes/chat"));
const learning_1 = __importDefault(require("./routes/learning"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const courses_1 = __importDefault(require("./routes/courses"));
const materials_1 = __importDefault(require("./routes/materials"));
const auth_1 = require("./middleware/auth");
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        console.log('🔄 Attempting MongoDB connection...');
        console.log('URI:', mongoUri?.replace(/:[^:]*@/, ':****@')); // Hide password
        if (!mongoUri) {
            console.log('⚠️ MONGODB_URI not configured in .env');
            return;
        }
        await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('❌ MongoDB connection error:', error.message);
            console.error('Error code:', error.code);
        }
        else {
            console.error('❌ MongoDB connection error:', error);
        }
    }
};
connectDB();
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
// CORS configuration for production
const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://personalized-learning-copilot.netlify.app',
    'https://personalized-learning-copilot-for-core-courses-1vbx5f6xu.vercel.app',
];
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});
exports.io = io;
// Performance middleware
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: true, // Allow all origins for testing
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.log(`⚠️ Slow request: ${req.method} ${req.path} - ${duration}ms`);
        }
    });
    next();
});
// Health check
// app.get('/health', (req: Request, res: Response) => {
//   res.json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//   });
// });
// API Status check endpoint
app.get('/api/status', async (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        status: 'online',
        message: 'Backend is running. API keys must be provided by users.',
        server: {
            port: process.env.PORT || 5000,
            environment: process.env.NODE_ENV || 'development'
        }
    });
});
// API Routes
app.use('/api/chat', auth_1.authMiddleware, (0, chat_1.default)(io));
app.use('/api/learning', auth_1.authMiddleware, learning_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/materials', auth_1.authMiddleware, materials_1.default);
// WebSocket Events
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('join_course', (courseId) => {
        socket.join(`course_${courseId}`);
        console.log(`User ${socket.id} joined course ${courseId}`);
    });
    socket.on('leave_course', (courseId) => {
        socket.leave(`course_${courseId}`);
        console.log(`User ${socket.id} left course ${courseId}`);
    });
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Graceful shutdown
const gracefulShutdown = () => {
    console.log('Received shutdown signal, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'https://personalized-learning-copilot.netlify.app'}`);
});
//# sourceMappingURL=index.js.map