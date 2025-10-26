import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserIconProps {
  onClick: () => void;
}

const UserIcon: React.FC<UserIconProps> = ({ onClick }) => {
  const { user } = useAuth();

  // Debug log
  console.log('🔍 UserIcon rendered! User:', user?.name, 'Avatar:', user?.avatar);

  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255, 120, 0, 0.95), rgba(255, 102, 0, 0.95))',
        border: '4px solid rgba(255, 255, 255, 0.8)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 120, 0, 1), rgba(255, 102, 0, 1))';
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 120, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 120, 0, 0.9), rgba(255, 102, 0, 0.9))';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
      }}
    >
      {user?.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name || 'User'}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            // Fallback to icon if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.setAttribute('style', 'display: block');
          }}
        />
      ) : null}
      <User 
        size={32} 
        color="white" 
        style={{ display: user?.avatar ? 'none' : 'block' }}
      />
    </button>
  );
};

export default UserIcon;