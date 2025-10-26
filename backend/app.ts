import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';

const app = express();

// Environment-specific configuration
const config = {
  development: {
    frontendUrl: 'http://localhost:3000',
    port: 4000
  },
  production: {
    frontendUrl: 'https://intinya-aja-dongs.vercel.app',
    port: process.env.PORT || 4000
  }
};

const environment = process.env.NODE_ENV || 'development';
const appConfig = config[environment as keyof typeof config];

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: appConfig.frontendUrl,
  credentials: true
}));

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "img-src 'self' data: https: http: *; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' https: http: *; " +
    "font-src 'self' data: https: http:;"
  );
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = appConfig.port;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${environment} mode`);
});