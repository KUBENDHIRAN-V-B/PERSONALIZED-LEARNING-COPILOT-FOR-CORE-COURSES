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
  const checkAPI = (options: https.RequestOptions, postData?: string): Promise<{ status: boolean; code: number }> => {
    return new Promise((resolve) => {
      const apiReq = https.request(options, (apiRes) => {
        resolve({ status: apiRes.statusCode === 200, code: apiRes.statusCode || 0 });
      });
      apiReq.on('error', () => resolve({ status: false, code: 0 }));
      apiReq.setTimeout(5000, () => { apiReq.destroy(); resolve({ status: false, code: 0 }); });
      if (postData) apiReq.write(postData);
      apiReq.end();
    });
  };

  const [gemini, openRouter, groq, cerebras] = await Promise.all([
    checkAPI({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }] })),
    checkAPI({
      hostname: 'openrouter.ai',
      path: '/api/v1/models',
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
    }),
    checkAPI({
      hostname: 'api.groq.com',
      path: '/openai/v1/models',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    }),
    checkAPI({
      hostname: 'api.cerebras.ai',
      path: '/v1/models',
      headers: { Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}` },
    }),
  ]);

  res.json({
    timestamp: new Date().toISOString(),
    apis: {
      gemini: { connected: gemini.status, code: gemini.code, name: 'Google Gemini', limit: '1,500/day', rpm: '15 RPM' },
      openRouter: { connected: openRouter.status, code: openRouter.code, name: 'OpenRouter', limit: 'Pay-as-you-go', rpm: 'Varies' },
      groq: { connected: groq.status, code: groq.code, name: 'Groq', limit: '14,400/day', rpm: '30 RPM' },
      cerebras: { connected: cerebras.status, code: cerebras.code, name: 'Cerebras', limit: '1,000/day', rpm: '30 RPM' },
    },
  });
});

// API Routes
app.use('/api/chat', chatRoutes(io));
app.use('/api/learning', learningRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/courses', courseRoutes);

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

export { app, io };
