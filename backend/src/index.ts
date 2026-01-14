import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import https from 'https';

// Import routes
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import learningRoutes from './routes/learning';
import analyticsRoutes from './routes/analytics';
import courseRoutes from './routes/courses';
import materialsRoutes from './routes/materials';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Load environment variables
dotenv.config();

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
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ MongoDB connection error:', error.message);
      console.error('Error code:', (error as any).code);
    } else {
      console.error('❌ MongoDB connection error:', error);
    }
  }
};

connectDB();

const app: Express = express();
const server = http.createServer(app);

// CORS configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://personalized-learning-copilot.netlify.app',
  'https://personalized-learning-copilot-for-core-courses-1vbx5f6xu.vercel.app',
];

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Performance middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
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
app.get('/api/status', async (req: Request, res: Response) => {
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
app.use('/api/chat', authMiddleware, chatRoutes(io));
app.use('/api/learning', authMiddleware, learningRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/materials', authMiddleware, materialsRoutes);

// WebSocket Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_course', (courseId: string) => {
    socket.join(`course_${courseId}`);
    console.log(`User ${socket.id} joined course ${courseId}`);
  });

  socket.on('leave_course', (courseId: string) => {
    socket.leave(`course_${courseId}`);
    console.log(`User ${socket.id} left course ${courseId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req: Request, res: Response) => {
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

// Export for serverless functions
export { app, io };
