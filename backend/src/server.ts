import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import vibelytubeRouter from './routes/vibelytube';
import authRouter from './routes/auth';
import prisma from './lib/prisma';
import passport from './lib/passport';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log(`🔍 Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

// Debug environment variables
console.log('🔍 Environment variables check:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT_FOUND',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'NOT_FOUND',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? `${process.env.YOUTUBE_API_KEY.substring(0, 15)}...` : 'NOT_FOUND'
});

// Log loaded environment variables (without sensitive values)
console.log('🔍 Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  // Log if keys exist without showing values
  OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
  OPENAI_BASE_URL_EXISTS: !!process.env.OPENAI_BASE_URL
});

const app = express();
const PORT = process.env.PORT || 4000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'vibelytube-essential-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    // For cross-site cookie usage (frontend hosted on a different origin),
    // set SameSite=None in production and ensure cookies are Secure.
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware
const allowedOrigins = [];
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(...process.env.CORS_ORIGIN.split(','));
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'VibelyTube Essential Backend - Intinya aja dongs!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      stats: '/api/stats', 
      vibelytube: '/api/vibelytube/*'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/vibelytube', vibelytubeRouter);

// Health check with database stats
app.get('/api/health', async (req, res) => {
  try {
    // Simple health check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      message: 'VibelyTube Essential Backend - Intinya aja dongs!',
      timestamp: new Date().toISOString(),
      database: {
        connected: true
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    // Get basic stats
    const userCount = await prisma.user.count();
    const videoCount = await prisma.video.count();
    const chatCount = await prisma.chat.count();
    
    res.json({
      users: userCount,
      videos: videoCount,
      chats: chatCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get database stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Global error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Server terminated...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('🗄️ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log('🚀 VibelyTube Essential Backend started');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
      console.log('💡 Intinya aja dongs - All the essentials!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
