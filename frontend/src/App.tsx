import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AnalysisPage from './components/AnalysisPage';
import CecepChatPage from './components/CecepChatPage';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import UserIcon from './components/UserIcon';
import { useAuth } from './contexts/AuthContext';

// Import styles
import './fonts.css';
import './components/cyberpunk.css';
import './components/cyberpunk-animations.css';

interface AnalysisResult {
  title?: string;
  transcript?: string;
  duration?: string;
  url?: string;
  description?: string;
  processedAt?: string;
  channelTitle?: string;
  viewCount?: number;
  likeCount?: number;
  sessionId?: string;
  id?: string;
  analysisId?: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'analysis' | 'chat' | 'login' | 'profile'>('landing');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Check URL parameters for auth success
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    const redirect = urlParams.get('redirect');
    
    if (authSuccess === 'success' && redirect === 'analysis') {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Redirect to analysis page
      setCurrentPage('analysis');
      localStorage.setItem('currentPage', 'analysis');
      return;
    }

    // Restore page state from localStorage if user is authenticated (but not if currently on profile)
    const savedPage = localStorage.getItem('currentPage');
    if (isAuthenticated && savedPage && (savedPage === 'analysis' || savedPage === 'chat' || savedPage === 'profile') && currentPage !== 'profile') {
      setCurrentPage(savedPage as any);
    } else if (isAuthenticated && currentPage === 'landing') {
      // If user is authenticated and on landing page, redirect to analysis
      setCurrentPage('analysis');
      localStorage.setItem('currentPage', 'analysis');
    } else if (!isAuthenticated) {
      // If not authenticated, clear saved page and go to landing
      localStorage.removeItem('currentPage');
      if (currentPage !== 'landing' && currentPage !== 'login') {
        setCurrentPage('landing');
      }
    }

    // Check if there's analysis data in localStorage when component mounts
    const storedAnalysis = localStorage.getItem('currentVideoAnalysis');
    const storedSession = localStorage.getItem('currentVideoSession');
    
    if (storedAnalysis) {
      try {
        const analysisData = JSON.parse(storedAnalysis);
        
        // Add sessionId to analysis data
        const enrichedData = {
          ...analysisData,
          sessionId: storedSession || 'default',
          analysisId: analysisData.id // Make sure analysisId is included
        };
        
        setAnalysisResult(enrichedData);
      } catch (error) {
        console.error('Failed to parse stored analysis data', error);
      }
    }

    // Listen for chat navigation events from AnalysisPage
    const handleNavigateToChat = (event: any) => {
      const { analysisData } = event.detail;
      setAnalysisResult(analysisData);
      setCurrentPage('chat');
      localStorage.setItem('currentPage', 'chat');
    };

    window.addEventListener('navigateToChat', handleNavigateToChat);

    return () => {
      window.removeEventListener('navigateToChat', handleNavigateToChat);
    };
  }, [isAuthenticated, currentPage]);

  const handleStartAnalysis = () => {
    // Check if user is authenticated before allowing analysis
    if (!isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage('analysis');
    localStorage.setItem('currentPage', 'analysis');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    setAnalysisResult(null);
    localStorage.removeItem('currentPage');
  };

  const handleGoToProfile = () => {
    console.log('🔍 Going to profile page...');
    setCurrentPage('profile');
    localStorage.setItem('currentPage', 'profile');
  };

  const handleBackToAnalysis = () => {
    setCurrentPage('analysis');
    localStorage.setItem('currentPage', 'analysis');
    // Keep analysisResult so user can see their previous analysis
  };

  // Main app content
  return (
    <div className="container" style={{ position: 'relative', minHeight: '100vh' }}>
      
      {/* User Icon - only show on analysis page when authenticated */}
      {(() => {
        console.log('🔍 Debug UserIcon:', { isAuthenticated, currentPage });
        return (isAuthenticated && currentPage === 'analysis') || currentPage === 'analysis' ? (
          <UserIcon onClick={handleGoToProfile} />
        ) : null;
      })()}

      {/* Current Page Content */}
      {currentPage === 'landing' && (
        <LandingPage onStartAnalysis={handleStartAnalysis} />
      )}

      {currentPage === 'login' && (
        <LoginPage onBackToLanding={handleBackToLanding} />
      )}

      {currentPage === 'profile' && (
        <ProfilePage onBackToAnalysis={handleBackToAnalysis} />
      )}

      {currentPage === 'analysis' && (
        <AnalysisPage />
      )}
      
      {currentPage === 'chat' && analysisResult && (
        <CecepChatPage 
          onBackClick={handleBackToAnalysis}
          initialVideoData={analysisResult}
        />
      )}
    </div>
  );
};

export default App;