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
import chatRoutes from '../src/routes/chat';

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
  'https://personalized-learning-copilot-for-core-courses.vercel.app',
  'https://kubendhiran-v-b.github.io',
  /\.netlify\.app$/,
  /\.vercel\.app$/,
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

// API Routes
app.use('/chat', chatRoutes);

// Netlify function handler
export const handler: Handler = serverless(app);