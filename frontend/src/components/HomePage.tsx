import React, { useState, FormEvent, KeyboardEvent } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface HomePageProps {
  onStartClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const sessionId = Date.now().toString();
      
      const response = await fetch(API_ENDPOINTS.ANALYZE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchQuery.trim(),
          sessionId: sessionId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Video analysis successful:', result.data.title);
        localStorage.setItem('currentVideoAnalysis', JSON.stringify(result.data));
        localStorage.setItem('currentVideoSession', sessionId);
        onStartClick();
      } else {
        console.error('❌ Analysis failed:', result.error);
        alert('Gagal menganalisis video. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('❌ Error calling backend:', error);
      alert('Terjadi kesalahan saat menghubungi server. Pastikan backend berjalan.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        handleSearch(e as unknown as FormEvent);
      }
    }
  };

  return (
    <div style={{ fontFamily: 'Nunito, sans-serif' }}>
      {/* Inline CSS for animations */}
      <style>{`
        @keyframes cloudMove {
          0%, 100% { transform: translateX(-50px); }
          50% { transform: translateX(50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          95% { opacity: 1; }
        }
        @keyframes rain {
          0% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
        @keyframes wind {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(300px); }
        }
        @keyframes waveMove {
          0%, 100% { transform: translateX(-50px); }
          50% { transform: translateX(50px); }
        }
        @keyframes bubble1 {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 1; }
        }
        @keyframes bubble2 {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.05); opacity: 0.9; }
        }
        @keyframes bubble3 {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.8; }
          50% { transform: translateY(-25px) scale(1.08); opacity: 1; }
        }
        @keyframes swim {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(calc(100vw + 100px)); }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes seaweed {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(5px) rotate(5deg); }
        }
      `}</style>

      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 5%',
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
          </svg>
          <span>Intinya aja dongs</span>
        </div>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="#beranda" style={{ textDecoration: 'none', color: '#3B82F6', fontWeight: 600 }}>Beranda</a>
          <a href="#fitur-utama" style={{ textDecoration: 'none', color: '#6B7280' }}>Cara Kerja</a>
          <a href="#team" style={{ textDecoration: 'none', color: '#6B7280' }}>Tim Kami</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        overflow: 'hidden'
      }}>
        <video 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            transform: 'translate(-50%, -50%)',
            zIndex: 0
          }}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
        >
          <source src="/1.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: '800px',
          padding: '0 2rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            Dapatkan Inti dari Video,<br />Tanpa Nonton Semuanya
          </h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Upload video YouTube, chat dengan AI, dapatkan insight penting dalam hitungan menit
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste URL YouTube di sini..."
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '10px',
                border: 'none',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              disabled={isAnalyzing}
              style={{
                padding: '1rem 2rem',
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analisis'}
            </button>
          </form>
        </div>
      </section>

      {/* Cara Kerja Section - Tema Hitam */}
      <section id="fitur-utama" style={{
        padding: '6rem 5% 3rem 5%',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #2c2c2c 50%, #1a1a1a 75%, #000000 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dark Pattern Background - No Stars */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'transparent',
          zIndex: 0
        }}></div>
        
        {/* Floating Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80px',
          height: '40px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '50px',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '120px',
          height: '60px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '60px',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            marginBottom: '1rem',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'white',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)'
          }}>Cara Kerja</h2>
          <p style={{
            marginBottom: '4rem',
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto 4rem',
            textShadow: '1px 1px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Proses sederhana untuk mendapatkan insight dari video YouTube dalam hitungan menit
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Step 1 */}
            <div style={{
              background: 'linear-gradient(135deg, #2c3e50, #34495e)',
              padding: '3rem 2rem',
              borderRadius: '25px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
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
                color: '#ffffff'
              }}>
                Paste URL YouTube
              </h3>
              <p style={{
                color: '#bdc3c7',
                lineHeight: 1.6,
                fontSize: '1rem'
              }}>
                Salin dan tempel URL video YouTube yang ingin Anda analisis ke dalam search bar di halaman utama
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              background: 'linear-gradient(135deg, #2c3e50, #34495e)',
              padding: '3rem 2rem',
              borderRadius: '25px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              position: 'relative',
              transform: 'translateY(-10px)',
              overflow: 'hidden'
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
                color: '#ffffff'
              }}>
                AI Analisis Video
              </h3>
              <p style={{
                color: '#bdc3c7',
                lineHeight: 1.6,
                fontSize: '1rem'
              }}>
                Sistem AI kami akan menganalisis konten video, mengekstrak audio, dan membuat transkrip otomatis
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              background: 'linear-gradient(135deg, #2c3e50, #34495e)',
              padding: '3rem 2rem',
              borderRadius: '25px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
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
                color: '#ffffff'
              }}>
                Chat dengan AI
              </h3>
              <p style={{
                color: '#bdc3c7',
                lineHeight: 1.6,
                fontSize: '1rem'
              }}>
                Tanyakan apa saja tentang video tersebut kepada Cecep AI dan dapatkan jawaban yang akurat dan detail
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section style={{
        padding: '3rem 5% 6rem 5%',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #2c2c2c 50%, #1a1a1a 75%, #000000 100%)',
        position: 'relative',
        textAlign: 'center',
        color: 'white',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>

        <div style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <h2 style={{
            marginBottom: '3rem',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'white',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            Testimoni Pengguna Intinya aja dongs
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            margin: '0 auto',
            maxWidth: '1400px'
          }}>
            {/* 6 Testimonial Cards */}
            {[
              { name: '@sinta_wijaya', img: 'https://randomuser.me/api/portraits/women/44.jpg', text: '"Saya chat dengan Cecep AI tentang video kuliah MIT yang 2 jam, langsung dapet poin-poin penting tanpa harus nonton semua. Genius banget!"' },
              { name: '@bagus_pratama', img: 'https://randomuser.me/api/portraits/men/32.jpg', text: '"Tutorial coding 3 jam di YouTube jadi mudah dipahami. Cecep AI bisa jawab pertanyaan detail tentang code yang dijelasin di video. Keren!"' },
              { name: '@maya_sari', img: 'https://randomuser.me/api/portraits/women/25.jpg', text: '"Buat mahasiswa seperti saya, ini sangat membantu. Video pembelajaran yang panjang jadi lebih mudah dipahami dengan bantuan AI. Worth it!"' },
              { name: '@rizki_nugroho', img: 'https://randomuser.me/api/portraits/men/15.jpg', text: '"Sebagai content creator, saya sering riset video kompetitor. Dengan tools ini, analisis video jadi lebih cepat dan detail. Amazing!"' },
              { name: '@dina_putri', img: 'https://randomuser.me/api/portraits/women/38.jpg', text: '"Video webinar 4 jam jadi mudah dipahami dalam 10 menit chat. AI-nya bisa jawab pertanyaan spesifik tentang materi. Game changer!"' },
              { name: '@andi_wijaya', img: 'https://randomuser.me/api/portraits/men/28.jpg', text: '"Untuk riset market dan tren, analisis video YouTube jadi lebih efisien. Data yang didapat juga akurat dan mudah dimengerti."' }
            ].map((testimonial, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(15px)',
                padding: '2.5rem',
                borderRadius: '20px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
                textAlign: 'left',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  gap: '1rem'
                }}>
                  <img 
                    src={testimonial.img} 
                    alt="User" 
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #3B82F6'
                    }} 
                  />
                  <span style={{ fontWeight: 600, color: '#3B82F6', fontSize: '1.1rem' }}>
                    {testimonial.name}
                  </span>
                </div>
                <p style={{
                  color: '#374151',
                  lineHeight: 1.8,
                  fontSize: '1rem',
                  fontStyle: 'italic'
                }}>
                  {testimonial.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section - Video Background */}
      <section id="team" style={{
        padding: '6rem 5%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <video 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            opacity: 1
          }}
          autoPlay 
          loop 
          muted 
          playsInline
          preload="auto"
        >
          <source src="/10.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.2)',
          zIndex: 1
        }}></div>

        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{
            marginBottom: '3rem',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: 'white',
            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.4)'
          }}>Tim Kami</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Team Members */}
            {[
              { name: 'Achmad Izan', role: 'PROJECT MANAGER', img: '/4.jpg', color: '#0891b2', desc: 'Mengelola tim dan memastikan proyek berjalan sesuai timeline yang ditentukan.' },
              { name: 'Muhammad Riyadhu', role: 'FULL STACK DEVELOPER', img: '/5.jpg', color: '#20b2aa', desc: 'Membangun antarmuka pengguna yang responsif dan backend yang powerful untuk aplikasi.', transform: 'translateY(-10px)' },
              { name: 'Oki Taruna Ramadhan', role: 'MACHINE LEARNING ENGINEER', img: '/3.jpg', color: '#00ced1', desc: 'Mengembangkan model AI dan algoritma machine learning untuk analisis video yang lebih akurat.' }
            ].map((member, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(15px)',
                padding: '2.5rem 2rem',
                borderRadius: '25px',
                boxShadow: '0 20px 40px rgba(0, 105, 148, 0.3)',
                textAlign: 'center',
                border: '3px solid rgba(103, 232, 249, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                transform: member.transform || 'translateY(0)'
              }}>
                <img 
                  src={member.img} 
                  alt={member.name} 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto 1.5rem',
                    border: `4px solid ${member.color}`,
                    boxShadow: `0 8px 20px ${member.color}40`,
                    position: 'relative',
                    zIndex: 1
                  }}
                />
                <h3 style={{ 
                  marginBottom: '0.5rem', 
                  color: '#0f172a',
                  fontWeight: 700,
                  position: 'relative',
                  zIndex: 1
                }}>{member.name}</h3>
                <p style={{ 
                  color: member.color, 
                  fontWeight: 600, 
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '0.9rem',
                  position: 'relative',
                  zIndex: 1
                }}>{member.role}</p>
                <p style={{ 
                  color: '#475569',
                  lineHeight: 1.6,
                  position: 'relative',
                  zIndex: 1
                }}>{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#111827',
        color: 'white',
        padding: '3rem 5%',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 8L16 12L10 16V8Z" fill="currentColor"/>
            </svg>
            <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Intinya aja dongs</span>
          </div>
          <p style={{ margin: 0, opacity: 0.8 }}>© 2025 Intinya aja dongs. Made with ❤️ by Team</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;