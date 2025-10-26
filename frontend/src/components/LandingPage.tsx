import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface LandingPageProps {
  onStartAnalysis: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartAnalysis }) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const panels = [
    { id: 'start', title: 'Mulai Analisis' },
    { id: 'cara-kerja', title: 'Cara Kerja' },
    { id: 'tim-kami', title: 'Tim Kami' },
    { id: 'testimoni', title: 'Testimoni' }
  ];

  const nextPanel = () => {
    setCurrentPanel((prev) => (prev + 1) % panels.length);
  };

  const prevPanel = () => {
    setCurrentPanel((prev) => (prev - 1 + panels.length) % panels.length);
  };

  // Check for error messages in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
    if (error === 'device_limit') {
      setErrorMessage(message || 'Perangkat ini telah mencapai batas maksimum 3 akun Google');
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
      
      // Auto hide after 10 seconds
      setTimeout(() => setErrorMessage(null), 10000);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPanel();
      if (e.key === 'ArrowRight') nextPanel();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Check for error messages in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
    if (error === 'device_limit') {
      setErrorMessage(message || 'Device limit exceeded (max 3 accounts per device)');
      
      // Clear URL parameters after showing error
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto clear error after 10 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 10000);
    }
  }, []);

  return (
    <div style={{ 
      fontFamily: 'Nunito, sans-serif',
      backgroundImage: 'url(/12.gif)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Error Message Notification */}
      {errorMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          maxWidth: '90%',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '600',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          animation: 'slideDown 0.5s ease-out'
        }}>
          <div style={{ marginBottom: '8px', fontSize: '18px' }}>
            ⚠️ Batas Maksimum Tercapai
          </div>
          <div style={{ fontSize: '14px', opacity: '0.9' }}>
            {errorMessage}
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              opacity: '0.7'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Add CSS animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      {/* Global Overlay untuk readability */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(2px)',
        zIndex: 0
      }} />

      {/* User Dashboard removed - no longer showing user details */}





      {/* Main Panel Container */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        transform: `translateX(-${currentPanel * 100}%)`,
        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Panel 1: Mulai Analisis */}
        <div style={{
          minWidth: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '30px',
            padding: '4rem 3rem',
            border: '1px solid rgba(100, 116, 139, 0.3)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #60a5fa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(96, 165, 250, 0.3)'
            }}>
              Intinya aja dongs
            </h1>
            
            <p style={{
              fontSize: '1.3rem',
              color: '#cbd5e1',
              marginBottom: '4rem',
              lineHeight: 1.6
            }}>
              Analisis video YouTube dengan AI. Dapatkan insight mendalam dan chat interaktif tentang konten video.
            </p>

            <button
              onClick={onStartAnalysis}
              style={{
                background: 'linear-gradient(135deg, #60a5fa, #34d399)',
                border: 'none',
                borderRadius: '15px',
                padding: '1.2rem 3rem',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                boxShadow: '0 10px 25px rgba(96, 165, 250, 0.4)',
                transform: 'scale(1)',
                margin: '0 auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(96, 165, 250, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(96, 165, 250, 0.4)';
              }}
            >
              <Play size={24} />
              Mulai Analisis Video
            </button>


          </div>
        </div>

        {/* Panel 2: Cara Kerja */}
        <div style={{
          minWidth: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            width: '100%'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, #60a5fa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(96, 165, 250, 0.3)'
            }}>Cara Kerja</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              margin: '0 auto'
            }}>
              {/* Step 1 */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(15px)',
                padding: '3rem 2rem',
                borderRadius: '25px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(135deg, #3498db, #2980b9)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2.5rem',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 10px 25px rgba(52, 152, 219, 0.5)'
                }}>
                  1
                </div>
                <h3 style={{
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#e2e8f0'
                }}>
                  Paste URL YouTube
                </h3>
                <p style={{
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}>
                  Salin dan tempel URL video YouTube yang ingin Anda analisis ke dalam search bar
                </p>
              </div>

              {/* Step 2 */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(15px)',
                padding: '3rem 2rem',
                borderRadius: '25px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(135deg, #27ae60, #229954)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2.5rem',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 10px 25px rgba(39, 174, 96, 0.5)'
                }}>
                  2
                </div>
                <h3 style={{
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#e2e8f0'
                }}>
                  AI Analisis Video
                </h3>
                <p style={{
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}>
                  Sistem AI menganalisis konten video, mengekstrak audio, dan membuat transkrip otomatis
                </p>
              </div>

              {/* Step 3 */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(15px)',
                padding: '3rem 2rem',
                borderRadius: '25px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '2.5rem',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 10px 25px rgba(155, 89, 182, 0.5)'
                }}>
                  3
                </div>
                <h3 style={{
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#e2e8f0'
                }}>
                  Chat dengan AI
                </h3>
                <p style={{
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}>
                  Mulai chat interaktif dengan AI tentang konten video dan dapatkan insight mendalam
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Tim Kami */}
        <div style={{
          minWidth: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            width: '100%'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, #60a5fa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(96, 165, 250, 0.3)'
            }}>Tim Kami</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              margin: '0 auto'
            }}>
              {/* Member 1 */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1.5rem',
                  border: '3px solid rgba(96, 165, 250, 0.5)'
                }}>
                  <img 
                    src="/3.jpg" 
                    alt="Achmad Izhan" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ color: '#e2e8f0', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Achmad Izhan</h3>
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1rem' }}>Frontend Developer</p>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Spesialis pengembangan antarmuka pengguna yang responsif dan interaktif
                </p>
              </div>

              {/* Member 2 */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1.5rem',
                  border: '3px solid rgba(167, 139, 250, 0.5)'
                }}>
                  <img 
                    src="/4.jpg" 
                    alt="Oki Taruna Ramadhan" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ color: '#e2e8f0', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Oki Taruna Ramadhan</h3>
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1rem' }}>Machine Learning Engineer</p>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Ahli machine learning yang mengembangkan model AI untuk analisis video
                </p>
              </div>

              {/* Member 3 */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1.5rem',
                  border: '3px solid rgba(251, 113, 133, 0.5)'
                }}>
                  <img 
                    src="/5.jpg" 
                    alt="Muhammad Riyadhu Jinan" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ color: '#e2e8f0', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Muhammad Riyadhu Jinan</h3>
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1rem' }}>Backend Developer</p>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Spesialis pengembangan server dan API yang robust untuk sistem AI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 4: Testimoni */}
        <div style={{
          minWidth: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            width: '100%'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '3rem',
              background: 'linear-gradient(135deg, #60a5fa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(96, 165, 250, 0.3)'
            }}>Testimoni</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              margin: '0 auto'
            }}>
              {/* Testimoni 1 */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(15px)',
                padding: '2.5rem 2rem',
                borderRadius: '25px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>⭐</div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1.5rem',
                  border: '4px solid #667eea'
                }}>
                  <img 
                    src="https://randomuser.me/api/portraits/women/44.jpg" 
                    alt="User" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h4 style={{
                  marginBottom: '1rem',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#e2e8f0'
                }}>Sarah Johnson</h4>
                <p style={{
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}>"Aplikasi ini luar biasa! Saya bisa menganalisis video tutorial dengan cepat dan mendapat insight yang sangat berguna."</p>
              </div>

              {/* Testimoni 2 */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(15px)',
                padding: '2.5rem 2rem',
                borderRadius: '25px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>🚀</div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1.5rem',
                  border: '4px solid #27ae60'
                }}>
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="User" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h4 style={{
                  marginBottom: '1rem',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#e2e8f0'
                }}>Ahmad Rizki</h4>
                <p style={{
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}>"Sebagai content creator, tools ini membantu saya menganalisis kompetitor dan meningkatkan kualitas konten. Highly recommended!"</p>
              </div>

              {/* Testimoni 3 */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(15px)',
                padding: '2.5rem 2rem',
                borderRadius: '25px',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #fd79a8, #e84393)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>💡</div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  margin: '0 auto 1.5rem',
                  border: '4px solid #9b59b6'
                }}>
                  <img 
                    src="https://randomuser.me/api/portraits/women/25.jpg" 
                    alt="User" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h4 style={{
                  marginBottom: '1rem',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#e2e8f0'
                }}>Maria Santos</h4>
                <p style={{
                  color: '#cbd5e1',
                  lineHeight: 1.6,
                  fontSize: '0.95rem'
                }}>"Interface yang user-friendly dan hasil analisis yang detail. Perfect untuk research dan pembelajaran!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default LandingPage;