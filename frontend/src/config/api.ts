// API Configuration for Vercel Fullstack
const isProduction = window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction 
  ? window.location.origin  // Same origin for Vercel fullstack
  : 'http://localhost:4000';  // Local backend

export const API_ENDPOINTS = {
  ANALYZE: `${API_BASE_URL}/api/vibelytube/analyze`,
  CHAT: `${API_BASE_URL}/api/vibelytube/chat`,
  UPLOAD: `${API_BASE_URL}/api/vibelytube/upload`,
  STATS: `${API_BASE_URL}/api/stats`
};

export default API_BASE_URL;