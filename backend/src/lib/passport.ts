import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import prisma from './prisma';

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  // Use configured callback URL (set in .env). Fall back to sensible defaults.
  callbackURL: process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === 'production'
    ? 'https://intinyaajadongs01.vercel.app/api/auth/google/callback'
    : 'http://localhost:4000/api/auth/google/callback')
}, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (user) {
      // Update last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
      return done(null, user);
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        googleId: profile.id,
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value || '',
        lastLogin: new Date(),
        createdAt: new Date()
      }
    });

    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done: (err: any, user?: Express.User | false | null) => void) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

export default passport;