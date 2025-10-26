import React, { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, User, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
  onBackToAnalysis: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBackToAnalysis }) => {
  const { user, logout } = useAuth();
  const [totalAnalysis, setTotalAnalysis] = useState(() => {
    // Initialize with cached value if available
    const cached = localStorage.getItem('userAnalysisCache');
    return cached ? parseInt(cached) : 0;
  });
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // Preload background image for instant display
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBackgroundLoaded(true);
    img.src = '/1.gif';
  }, []);

  // Load total analysis from database API with smart caching
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/vibelytube/user/stats', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTotalAnalysis(data.data.totalAnalyses);
            // Cache the result for instant loading next time
            localStorage.setItem('userAnalysisCache', data.data.totalAnalyses.toString());
            localStorage.setItem('userAnalysisCacheTime', Date.now().toString());
          }
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      }
    };

    // Check if cache is fresh (less than 30 seconds old)
    const cacheTime = localStorage.getItem('userAnalysisCacheTime');
    const now = Date.now();
    const cacheAge = cacheTime ? now - parseInt(cacheTime) : Infinity;
    
    if (cacheAge > 30000) { // 30 seconds
      fetchUserStats();
    }
  }, [user]);

  // Listen for new analysis events with instant update
  useEffect(() => {
    const handleNewAnalysis = async () => {
      // Instant update for better UX
      setTotalAnalysis(prev => prev + 1);
      localStorage.setItem('userAnalysisCache', (totalAnalysis + 1).toString());
      localStorage.setItem('userAnalysisCacheTime', Date.now().toString());
      
      // Background sync with server for accuracy
      try {
        const response = await fetch('/api/vibelytube/user/stats', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTotalAnalysis(data.data.totalAnalyses);
            localStorage.setItem('userAnalysisCache', data.data.totalAnalyses.toString());
            localStorage.setItem('userAnalysisCacheTime', Date.now().toString());
          }
        }
      } catch (error) {
        console.error('Failed to refresh user stats:', error);
      }
    };

    // Listen for analysis completion events
    window.addEventListener('analysisCompleted', handleNewAnalysis);
    
    return () => {
      window.removeEventListener('analysisCompleted', handleNewAnalysis);
    };
  }, [totalAnalysis]);

  const handleLogout = async () => {
    try {
      await logout();
      // Clear saved page state
      localStorage.removeItem('currentPage');
      // Force reload to reset authentication state completely
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear local state and redirect
      localStorage.removeItem('currentPage');
      window.location.href = '/';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{
      fontFamily: 'Nunito, sans-serif',
      background: backgroundLoaded 
        ? 'url(/1.gif)' 
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.5s ease-in-out',
      overflow: 'hidden'
    }}>
      {/* Global Overlay - dibuat lebih cerah */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'brightness(1.3) contrast(1.2)',
        zIndex: 1
      }}></div>

      {/* Back Button */}
      <button
        onClick={onBackToAnalysis}
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          color: 'white',
          padding: '12px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 10,
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <ArrowLeft size={24} />
      </button>

      {/* Profile Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '50px 40px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Avatar */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          margin: '0 auto 30px',
          background: 'linear-gradient(135deg, #ff7800 0%, #ff6600 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(255, 120, 0, 0.4)'
        }}>
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <User size={60} color="white" />
          )}
        </div>

        {/* User Info */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1f2937',
          marginBottom: '10px',
          fontFamily: 'Nunito, sans-serif'
        }}>
          {user?.name || 'User'}
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          fontWeight: '600',
          marginBottom: '30px'
        }}>
          {user?.email}
        </p>

        {/* Join Date */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '25px',
          padding: '15px',
          background: 'rgba(255, 120, 0, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 120, 0, 0.2)'
        }}>
          <Calendar size={20} color="#ff7800" />
          <span style={{
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600'
          }}>
            Bergabung sejak {user?.createdAt ? formatDate(user.createdAt) : 'Tidak diketahui'}
          </span>
        </div>

        {/* Total Analysis Activity */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1))',
          borderRadius: '15px',
          border: '2px solid rgba(59, 130, 246, 0.2)',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <BarChart3 size={24} color="#3b82f6" />
            <span style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              Total Analisis
            </span>
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#3b82f6',
            fontFamily: 'Nunito, sans-serif',
            textShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
          }}>
            {totalAnalysis}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '5px'
          }}>
            Video yang telah dianalisis
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            color: 'white',
            padding: '18px 24px',
            fontSize: '18px',
            fontWeight: '700',
            borderRadius: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
            fontFamily: 'Nunito, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(239, 68, 68, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.4)';
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;