import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Monitor, Clock, LogOut } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user, usage, logout } = useAuth();

  if (!user || !usage) return null;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
        {/* User info */}
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-white/30"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {user.name}
            </p>
            <p className="text-gray-300 text-xs truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* Usage stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-300">
              <Monitor className="w-4 h-4" />
              <span>Device Usage</span>
            </div>
            <span className="text-white font-medium">
              {usage.usageCount}/{usage.maxUsage}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usage.remainingUsage === 0 
                  ? 'bg-red-500' 
                  : usage.remainingUsage === 1 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
              }`}
              style={{ 
                width: `${(usage.usageCount / usage.maxUsage) * 100}%` 
              }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              {usage.remainingUsage} kali tersisa
            </span>
            {usage.lastUsed && (
              <div className="flex items-center space-x-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(usage.lastUsed).toLocaleDateString('id-ID')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Warning if usage is running out */}
        {usage.remainingUsage === 0 && (
          <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-xs text-center">
              Anda telah mencapai batas maksimal untuk device ini
            </p>
          </div>
        )}
        
        {usage.remainingUsage === 1 && (
          <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-xs text-center">
              Sisa 1 kali penggunaan lagi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;