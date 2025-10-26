import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onBackToLanding?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding }) => {
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div style={{
      fontFamily: 'Nunito, sans-serif',
      backgroundImage: 'url(/12.gif)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Global Overlay untuk readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }}></div>

      {/* Back Button */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
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
      )}

      {/* Login Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '50px 40px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '450px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#1f2937',
            marginBottom: '10px',
            fontFamily: 'Nunito, sans-serif'
          }}>
            Login
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            fontWeight: '600'
          }}>
            Masuk untuk melanjutkan
          </p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #ff7800 0%, #ff6600 100%)',
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
            boxShadow: '0 10px 25px rgba(255, 120, 0, 0.4)',
            fontFamily: 'Nunito, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 120, 0, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 120, 0, 0.4)';
          }}
        >
          {/* Google Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Masuk dengan Google</span>
        </button>

        {/* Additional Info */}
        <div style={{ 
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(255, 120, 0, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 120, 0, 0.2)'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#374151',
            margin: 0,
            lineHeight: '1.5'
          }}>
            🔒 Login aman dengan akun Google Anda untuk mengakses fitur analisis video YouTube
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;