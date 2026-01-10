import { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import routes
import learningRoutes from '../src/routes/learning';

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

// CORS configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://personalized-learning-copilot-for-core-courses.vercel.app',
  /\.vercel\.app$/,
  /\.netlify\.app$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) return callback(null, true);

    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Connect to DB before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// API Routes
app.use('/learning', learningRoutes);

// Export for Vercel
export default serverless(app);