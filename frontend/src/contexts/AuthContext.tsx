import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  totalAnalyses: number;
  lastLogin: string;
  createdAt: string;
}

interface UsageStats {
  deviceId: string;
  usageCount: number;
  maxUsage: number;
  remainingUsage: number;
  lastUsed?: string;
}

interface AuthContextType {
  user: User | null;
  usage: UsageStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  getUsageStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:4000' 
      : window.location.origin);

  // Generate device fingerprint
  const getDeviceId = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('device-fingerprint', 2, 2);
    const fingerprint = canvas.toDataURL();
    
    const deviceInfo = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      fingerprint
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < deviceInfo.length; i++) {
      const char = deviceInfo.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  };

  const preloadUserStats = async () => {
    try {
      const response = await fetch('/api/vibelytube/user/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Cache for instant profile loading
          localStorage.setItem('userAnalysisCache', data.data.totalAnalyses.toString());
          localStorage.setItem('userAnalysisCacheTime', Date.now().toString());
        }
      }
    } catch (error) {
      console.error('Failed to preload user stats:', error);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        credentials: 'include',
        headers: {
          'x-device-id': getDeviceId()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          await getUsageStats();
          // Preload user stats for faster profile page
          await preloadUserStats();
        } else {
          setUser(null);
          setUsage(null);
        }
      } else {
        setUser(null);
        setUsage(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setUsage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsageStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/usage`, {
        credentials: 'include',
        headers: {
          'x-device-id': getDeviceId()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      setUser(null);
      setUsage(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    usage,
    isLoading,
    isAuthenticated: !!user,
    checkAuth,
    logout,
    getUsageStats
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please login to access this feature</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};