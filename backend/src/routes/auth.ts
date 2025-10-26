import express from 'express';
import passport from '../lib/passport';
import prisma from '../lib/prisma';

const router = express.Router();

// Prefer environment-configured frontend/back URLs; fall back to sensible defaults
const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production'
  ? 'https://intinyaajadongs01.vercel.app'
  : 'http://localhost:3000');

const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === 'production'
  ? 'https://intinyaajadongs01.vercel.app/api/auth/google/callback'
  : 'http://localhost:4000/api/auth/google/callback');

// Google Auth Routes
// Google Auth Routes

// Logout route
router.post('/logout', (req, res) => {
  if (req.logout) {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error during logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  } else {
    res.json({ message: 'Already logged out' });
  }
});

// Middleware to check if user is authenticated
export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated?.()) {
     return next();
  }
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please login with Google to access this feature'
  });
};

// Middleware to check device usage limit
export const checkDeviceLimit = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const user = req.user as any;
    const deviceId = (req.headers['x-device-id'] as string) || req.ip || 'unknown';
    
    // Get user's device usage
    const deviceUsage = await prisma.deviceUsage.findFirst({
      where: {
        userId: user.id,
        deviceId: deviceId
      }
    });

    if (!deviceUsage) {
      // First time using this device
      await prisma.deviceUsage.create({
        data: {
          userId: user.id,
          deviceId: deviceId,
          usageCount: 1,
          lastUsed: new Date()
        }
      });
      return next();
    }

    if (deviceUsage.usageCount >= 3) {
      return res.status(403).json({
        error: 'Device limit exceeded',
        message: 'You have reached the maximum usage limit (3 accounts) for this device',
        usageCount: deviceUsage.usageCount,
        maxUsage: 3
      });
    }

    // Increment usage count
    await prisma.deviceUsage.update({
      where: { id: deviceUsage.id },
      data: {
        usageCount: deviceUsage.usageCount + 1,
        lastUsed: new Date()
      }
    });

    next();
  } catch (error) {
    console.error('Device limit check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Google OAuth login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
  async (req, res) => {
    try {
      const user = req.user as any;
      const deviceId = (req.headers['x-device-id'] as string) || req.ip || 'unknown';
      
      // Check device limit for new user
      const existingDeviceUsage = await prisma.deviceUsage.findFirst({
        where: {
          deviceId: deviceId
        }
      });
      
      // Count unique users on this device
      const uniqueUsersOnDevice = await prisma.deviceUsage.groupBy({
        by: ['userId'],
        where: {
          deviceId: deviceId
        }
      });
      
      const userCount = uniqueUsersOnDevice.length;
      
      // Check if this user already used this device
      const userDeviceUsage = await prisma.deviceUsage.findFirst({
        where: {
          userId: user.id,
          deviceId: deviceId
        }
      });
      
      // If user is new to this device and device already has 3 users, reject
      if (!userDeviceUsage && userCount >= 3) {
  req.logout?.(() => {});
  const frontendUrl = process.env.FRONTEND_URL;
        return res.redirect(`${frontendUrl}/?error=device_limit&message=Device limit exceeded (max 3 accounts per device)`);
      }
      
      // Successful authentication - redirect to analysis page
  const frontendUrl = process.env.FRONTEND_URL;
      res.redirect(`${frontendUrl}/?auth=success&redirect=analysis`);
    } catch (error) {
      console.error('Callback error:', error);
  const frontendUrl = process.env.FRONTEND_URL;
      res.redirect(`${frontendUrl}/?error=server_error`);
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout?.((err?: Error) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Get current user
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: req.user,
    authenticated: true
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated?.(),
    user: req.user || null
  });
});

// Get user's device usage stats
router.get('/usage', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const deviceId = req.headers['x-device-id'] as string || req.ip;
    
    const deviceUsage = await prisma.deviceUsage.findFirst({
      where: {
        userId: user.id,
        deviceId: deviceId
      }
    });

    res.json({
      deviceId,
      usageCount: deviceUsage?.usageCount || 0,
      maxUsage: 2,
      remainingUsage: Math.max(0, 2 - (deviceUsage?.usageCount || 0)),
      lastUsed: deviceUsage?.lastUsed || null
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

export default router;