import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import https from 'https';

// Import routes
import authRoutes from '../src/routes/auth';
import chatRoutes from '../src/routes/chat';
import learningRoutes from '../src/routes/learning';
import analyticsRoutes from '../src/routes/analytics';
import courseRoutes from '../src/routes/courses';

// Import middleware
import { errorHandler } from '../src/middleware/errorHandler';
import { authMiddleware } from '../src/middleware/auth';

// Load environment variables
dotenv.config();

// MongoDB connection (cached for serverless)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri !== 'mongodb://localhost:27017/learning_copilot') {
      await mongoose.connect(mongoUri);
      isConnected = true;
      console.log('📦 MongoDB connected successfully');
    } else {
      console.log('⚠️ MongoDB not configured. Using in-memory storage.');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

const app: Express = express();

// CORS configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://personalized-learning-copilot-for-core-courses.vercel.app',
  /\.vercel\.app$/,
  /\.netlify\.app$/,
];

// Performance middleware
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin or pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    
    if (isAllowed) return callback(null, true);
    
    // In development, allow all
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to DB before handling requests
app.use(async (req: Request, res: Response, next: NextFunction) => {
  await connectDB();
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'netlify-serverless',
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
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

// Create a mock io object for chat routes (WebSocket not supported in serverless)
const mockIo = {
  to: () => ({ emit: () => {} }),
  emit: () => {},
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', authMiddleware, chatRoutes(mockIo as any));
app.use('/api/learning', authMiddleware, learningRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/courses', authMiddleware, courseRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Export for Vercel
export default app;
