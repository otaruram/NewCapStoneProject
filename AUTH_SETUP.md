# VibelyTube Authentication Setup Guide

## 🚀 Setup Google OAuth

1. **Buat Google Cloud Project:**
   - Kunjungi: https://console.cloud.google.com/
   - Buat project baru: "VibelyTube-Auth"

2. **Enable Google+ API:**
   - Navigation: APIs & Services > Library
   - Cari "Google+ API" dan enable

3. **Buat OAuth Credentials:**
   - Navigation: APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Authorized redirect URIs:
     - http://localhost:4000/api/auth/google/callback (development)
     - https://your-domain.vercel.app/api/auth/google/callback (production)

4. **Update Environment Variables:**
   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   SESSION_SECRET=your-random-32-character-string
   FRONTEND_URL=http://localhost:5173
   ```

## 🎯 Features Implemented

### ✅ Authentication System
- ✅ Google OAuth login dengan Passport.js
- ✅ Session management
- ✅ Automatic redirect setelah login
- ✅ Logout functionality

### ✅ Device Limit System
- ✅ Device fingerprinting
- ✅ Tracking 2x usage per device
- ✅ Database storage untuk usage stats
- ✅ Real-time usage display

### ✅ UI Components
- ✅ Futuristic login page dengan glassmorphism
- ✅ User dashboard dengan usage stats
- ✅ Progress bar untuk remaining usage
- ✅ Responsive design

### ✅ Protected Routes
- ✅ Middleware untuk authentication check
- ✅ Device limit enforcement
- ✅ Automatic redirect ke login jika belum auth

## 🔄 Flow Aplikasi

1. **Landing Page**: User melihat tombol "Mulai Analisis"
2. **Auth Check**: Klik tombol → check authentication
3. **Login Page**: Jika belum login → redirect ke login
4. **Google OAuth**: User login dengan Google
5. **Callback**: Redirect kembali dengan session
6. **Analysis Page**: Akses granted dengan device tracking
7. **Usage Limit**: System track dan limit 2x per device

## 📊 Database Schema

```sql
Users:
- id, googleId, email, name, avatar
- lastLogin, createdAt, updatedAt

DeviceUsage:
- id, userId, deviceId, usageCount
- lastUsed, createdAt
- UNIQUE(userId, deviceId)
```

## 🛠 Development Commands

```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev

# Fullstack build
npm run build
```

## 🌐 Deployment

Backend sudah include:
- Passport configuration
- Session management
- Protected routes
- Device tracking

Frontend sudah include:
- AuthContext
- Login component
- Protected routing
- Usage dashboard

Ready untuk deploy ke Vercel + Render! 🎉