import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Clock, Eye, ThumbsUp, Zap } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface AnalysisPageProps {
  // Props interface - onBackToLanding removed as not used in authenticated mode
}

const AnalysisPage: React.FC<AnalysisPageProps> = () => {
  const [url, setUrl] = useState('');
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [dailyCredit, setDailyCredit] = useState({
    todayAnalysis: 0,
    maxDailyAnalysis: 2,
    canAnalyze: true
  });

  // Preload background images for instant display
  useEffect(() => {
    const img = new Image();
    img.onload = () => setBackgroundLoaded(true);
    img.src = '/11.gif';
  }, []);

  // Function to format duration
  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'N/A';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Function to format view count
  const formatViewCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Fetch daily credits on component mount
  useEffect(() => {
    fetchDailyCredits();
  }, []);

  const fetchDailyCredits = async () => {
    try {
      console.log('🔍 Fetching daily credits...');
      const response = await fetch('/api/vibelytube/user/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Daily credits response:', data);
        if (data.success && data.data.dailyCredit) {
          setDailyCredit(data.data.dailyCredit);
          console.log('✅ Daily credits updated:', data.data.dailyCredit);
        }
      } else {
        console.error('❌ Failed to fetch daily credits:', response.status);
      }
    } catch (error) {
      console.error('❌ Failed to fetch daily credits:', error);
    }
  };

  const handleSearch = async () => {
    if (!url.trim()) return;
    
    // Check daily limit before proceeding
    if (!dailyCredit.canAnalyze) {
      alert(`Batas analisis harian tercapai! Anda sudah menggunakan ${dailyCredit.todayAnalysis}/${dailyCredit.maxDailyAnalysis} analisis hari ini.`);
      return;
    }
    
    setIsLoading(true);
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(API_ENDPOINTS.ANALYZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({ 
          url: url.trim(),
          sessionId: sessionId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const analysisData = {
            ...result.data,
            sessionId: sessionId
          };
          
          // Store analysis data in localStorage for chat page
          localStorage.setItem('currentVideoAnalysis', JSON.stringify(analysisData));
          localStorage.setItem('currentVideoSession', sessionId);
          
          setVideoDetails(analysisData);
          console.log('✅ Video analysis completed:', analysisData.title);
          
          // Optimistic update - immediately update credit UI
          setDailyCredit(prev => ({
            ...prev,
            todayAnalysis: prev.todayAnalysis + 1,
            canAnalyze: (prev.todayAnalysis + 1) < prev.maxDailyAnalysis
          }));
          
          // Trigger analysis completion event for profile page
          window.dispatchEvent(new CustomEvent('analysisCompleted', {
            detail: { analysisData }
          }));
          
          // Refresh daily credits from server to confirm
          setTimeout(async () => {
            await fetchDailyCredits();
            console.log('🔄 Daily credits refreshed from server');
          }, 500);
          
          // Update total analysis count
          const currentTotal = parseInt(localStorage.getItem('userTotalAnalysis') || '0');
          localStorage.setItem('userTotalAnalysis', (currentTotal + 1).toString());
        } else {
          console.error('Analysis failed:', result.error);
          alert('Gagal menganalisis video: ' + result.error);
        }
      } else {
        // Handle daily limit error
        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.error === 'Daily limit exceeded') {
            alert(errorData.message);
            fetchDailyCredits(); // Refresh to show updated limits
            return;
          }
        }
        console.error('HTTP Error:', response.status);
        alert('Terjadi kesalahan saat menganalisis video');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Tidak dapat terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };



  const handleChatNavigation = () => {
    if (videoDetails && videoDetails.sessionId) {
      // Navigate to chat using React routing (not window.location)
      window.dispatchEvent(new CustomEvent('navigateToChat', { 
        detail: { 
          analysisData: videoDetails,
          fromAnalysis: true // Mark that we're coming from analysis page
        } 
      }));
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Nunito, sans-serif', 
      minHeight: '100vh',
      width: '100vw',
      background: backgroundLoaded 
        ? 'url(/11.gif)' 
        : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      transition: 'background 0.5s ease-in-out',
      overflow: 'auto'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '1.5rem 5%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Back button removed for authenticated users */}
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #60a5fa, #34d399, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(96, 165, 250, 0.5)'
          }}>
            Intinya Aja Dongs!
          </div>
        </div>
      </header>

      {/* Main Analysis Section */}
      <main style={{ padding: '3rem 5%', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.2)',
          backdropFilter: 'blur(5px)',
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(100, 116, 139, 0.1)',
          position: 'relative'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #60a5fa, #34d399, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 50px rgba(96, 165, 250, 0.3)',
            letterSpacing: '-1px'
          }}>
            Analisis Video YouTube
          </h1>
          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '1.2rem',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            fontWeight: 300,
            lineHeight: 1.6
          }}>
            Masukkan URL video YouTube untuk mendapatkan analisis mendalam dengan AI futuristik
          </p>

          {/* Daily Credits Display */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.8)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <Zap style={{ 
              color: dailyCredit.canAnalyze ? '#34d399' : '#ef4444', 
              width: '20px', 
              height: '20px' 
            }} />
            <span style={{
              color: dailyCredit.canAnalyze ? '#34d399' : '#ef4444',
              fontWeight: 600,
              fontSize: '1.1rem'
            }}>
              Analisis Harian: {dailyCredit.todayAnalysis}/{dailyCredit.maxDailyAnalysis}
            </span>
          </div>

          {/* URL Input Section */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(15px)',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#e2e8f0',
              textShadow: '0 0 20px rgba(96, 165, 250, 0.5)'
            }}>
              <Search size={22} color="#60a5fa" />
              Analisis dari URL YouTube
            </h3>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  flex: 1,
                  padding: '1.2rem 1.8rem',
                  border: '2px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '15px',
                  fontSize: '1.1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  background: 'rgba(15, 23, 42, 0.7)',
                  color: '#e2e8f0',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#60a5fa';
                  e.target.style.boxShadow = 'inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 0 20px rgba(96, 165, 250, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.target.style.boxShadow = 'inset 0 2px 10px rgba(0, 0, 0, 0.3)';
                }}
              />
              <button
                onClick={handleSearch}
                disabled={!url.trim() || isLoading}
                style={{
                  background: url.trim() ? 'linear-gradient(135deg, #60a5fa, #34d399)' : 'rgba(100, 116, 139, 0.3)',
                  color: url.trim() ? '#0f172a' : '#64748b',
                  border: url.trim() ? '2px solid rgba(96, 165, 250, 0.5)' : '2px solid rgba(100, 116, 139, 0.3)',
                  borderRadius: '15px',
                  padding: '1.2rem 2.5rem',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: url.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  boxShadow: url.trim() ? '0 8px 25px rgba(96, 165, 250, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'none',
                  textShadow: url.trim() ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (url.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(96, 165, 250, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = url.trim() ? '0 8px 25px rgba(96, 165, 250, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'none';
                }}
              >
                {isLoading ? 'Memproses...' : 'Analisis'}
              </button>
            </div>
          </div>



          {/* Video Details */}
          {videoDetails && (
            <div style={{
              marginTop: '3rem',
              background: 'rgba(15, 23, 42, 0.85)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              position: 'relative'
            }}>
              {/* Overlay untuk readability */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(2px)'
              }} />
              <div style={{
                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(52, 211, 153, 0.8))',
                color: 'white',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                  Video Berhasil Dianalisis
                </h3>
              </div>
              
              <div style={{
                padding: '2.5rem',
                display: 'grid',
                gridTemplateColumns: '300px 1fr',
                gap: '2.5rem',
                alignItems: 'start',
                position: 'relative',
                zIndex: 1
              }}>
                {/* Video Thumbnail */}
                <div style={{
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                  position: 'relative'
                }}>
                  <img
                    src={videoDetails.thumbnail || videoDetails.thumbnailUrl}
                    alt="Video thumbnail"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} />
                    {formatDuration(videoDetails.duration)}
                  </div>
                </div>

                {/* Video Info */}
                <div>
                  <h4 style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    color: '#1f2937',
                    lineHeight: 1.3
                  }}>
                    {videoDetails.title}
                  </h4>
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#6b7280'
                    }}>
                      <Eye size={16} />
                      <span style={{ fontSize: '0.9rem' }}>
                        {formatViewCount(videoDetails.viewCount)} views
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#6b7280'
                    }}>
                      <ThumbsUp size={16} />
                      <span style={{ fontSize: '0.9rem' }}>
                        {formatViewCount(videoDetails.likeCount)} likes
                      </span>
                    </div>
                  </div>

                  <p style={{
                    color: '#4b5563',
                    lineHeight: 1.6,
                    fontSize: '0.95rem',
                    marginBottom: '2rem'
                  }}>
                    {videoDetails.description?.substring(0, 200)}...
                  </p>

                  <button
                    onClick={handleChatNavigation}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '1rem 2rem',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <MessageCircle size={20} />
                    Chat dengan AI tentang Video Ini
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>
      </main>
    </div>
  );
};

export default AnalysisPage;
