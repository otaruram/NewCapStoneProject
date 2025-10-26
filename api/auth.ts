import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      message: 'Auth API endpoint',
      endpoints: [
        'GET /api/auth/google',
        'GET /api/auth/google/callback',
        'POST /api/auth/logout',
        'GET /api/auth/me'
      ]
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}