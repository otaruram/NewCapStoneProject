import express from 'express';
import fetch from 'node-fetch';

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  token_type: string;
  expiry_date: number;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture: string;
}

const router = express.Router();

const config = {
  development: {
    callbackUrl: 'http://localhost:4000/api/auth/callback',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    frontendUrl: 'http://localhost:3000',
    defaultRedirect: 'http://localhost:3000/analysis'
  },
  production: {
    callbackUrl: 'https://intinya-aja-dongs-backend.vercel.app/auth/callback',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    frontendUrl: 'https://intinya-aja-dongs.vercel.app',
    defaultRedirect: 'https://intinya-aja-dongs.vercel.app/analysis'
  }
};

// Check authentication status
router.get('/check', (req, res) => {
  if (!req.cookies.session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.status(200).json({ authenticated: true });
});

// Handle login
router.get('/login', (req, res) => {
  const env = process.env.NODE_ENV || 'development';
  const currentConfig = config[env as keyof typeof config];
  
  // Store the callback URL in cookie for later use
  const callback = req.query.callback as string || currentConfig.frontendUrl;
  res.cookie('intended_redirect', callback, { 
    httpOnly: true, 
    secure: env === 'production',
    sameSite: 'lax'
  });
  
  // Construct Google OAuth URL
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${currentConfig.clientId}&` +
    `redirect_uri=${encodeURIComponent(currentConfig.callbackUrl)}&` +
    `response_type=code&` +
    `scope=email profile&` +
    `access_type=offline`;

  // Redirect to Google's OAuth page
  res.redirect(googleAuthUrl);
    `redirect_uri=${encodeURIComponent(currentConfig.callbackUrl)}&` +
    `response_type=code&` +
    `scope=email profile&` +
    `access_type=offline`;
  
  res.redirect(googleAuthUrl);
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const env = process.env.NODE_ENV || 'development';
    const currentConfig = config[env as keyof typeof config];
    const code = req.query.code as string;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: currentConfig.clientId,
        client_secret: currentConfig.clientSecret,
        redirect_uri: currentConfig.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokens = await tokenResponse.json() as GoogleTokens;

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userInfo = await userInfoResponse.json() as GoogleUserInfo;

    // Set session cookie
    res.cookie('session', tokens.access_token, {
      httpOnly: true,
      secure: env === 'production',
      sameSite: 'lax'
    });

    // Get intended redirect URL or default to analysis page
    const redirectUrl = req.cookies.intended_redirect || currentConfig.defaultRedirect;
    res.clearCookie('intended_redirect');

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Auth callback error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// Handle logout
router.post('/logout', (req, res) => {
  res.clearCookie('session');
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;