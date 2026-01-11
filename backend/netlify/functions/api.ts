import { Handler } from '@netlify/functions';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import serverless from 'serverless-http';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from '../../src/routes/auth';
import chatRoutes from '../../src/routes/chat';
import learningRoutes from '../../src/routes/learning';
import analyticsRoutes from '../../src/routes/analytics';
import courseRoutes from '../../src/routes/courses';
import materialsRoutes from '../../src/routes/materials';

// Import middleware
import { errorHandler } from '../../src/middleware/errorHandler';

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

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://kubendhiran-v-b.github.io',
  'https://personalized-learning-copilot-for-core-courses.vercel.app',
  /\.netlify\.app$/,
  /\.vercel\.app$/,
  /\.github\.io$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      }
      return allowed.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Connect to DB before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/learning', learningRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/courses', courseRoutes);
app.use('/materials', materialsRoutes);

// Error handling
app.use(errorHandler);

// Netlify function handler
export const handler: Handler = serverless(app);