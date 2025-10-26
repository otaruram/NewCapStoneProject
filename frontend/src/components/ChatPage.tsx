import React from 'react';
import BelajarBotSidebar from './BelajarBotSidebar';
import './ChatPage-dark.css';

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
}

interface ChatPageProps {
  onBackClick: () => void;
  analysisResult: AnalysisResult;
}

const ChatPage: React.FC<ChatPageProps> = ({ onBackClick, analysisResult }) => {
  // Helper function to extract YouTube video ID
  const getYoutubeId = (url: string): string => {
    try {
      const urlObj = new URL(url);
      let id = '';
      
      if (urlObj.hostname.includes('youtube.com')) {
        id = urlObj.searchParams.get('v') || '';
      } else if (urlObj.hostname.includes('youtu.be')) {
        id = urlObj.pathname.substring(1);
      }
      
      return id;
    } catch (e) {
      console.error('Failed to parse YouTube URL', e);
      return '';
    }
  };

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="ai-assistant-info">
            <div className="ai-avatar">SK</div>
            <div className="ai-info">
              <h3 className="ai-name">SITI KHADIJAH</h3>
              <p className="ai-status">
                <span className="status-indicator"></span>
                AI ASSISTANT - ONLINE
              </p>
            </div>
          </div>
          <button className="back-button" onClick={onBackClick}>
            &larr; Kembali
          </button>
        </div>

        {/* Video Info */}
        <div className="video-info-sidebar">
          <div className="video-thumbnail-sidebar">
            {analysisResult.url && analysisResult.url.includes('youtube') ? (
              <img 
                src={`https://img.youtube.com/vi/${getYoutubeId(analysisResult.url)}/mqdefault.jpg`}
                alt={analysisResult.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const videoId = getYoutubeId(analysisResult.url || '');
                  if (videoId) {
                    target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }
                }}
              />
            ) : (
              <div className="video-placeholder-sidebar">📹</div>
            )}
          </div>
          <div className="video-details">
            <h4 className="video-title-sidebar">{analysisResult.title || 'Video Tanpa Judul'}</h4>
            <p className="video-meta-sidebar">
              {analysisResult.channelTitle && `By ${analysisResult.channelTitle}`}
            </p>
            <div className="video-stats">
              {analysisResult.duration && (
                <div className="stat-item">
                  <span>⏱️</span>
                  <span>{analysisResult.duration}</span>
                </div>
              )}
              {analysisResult.viewCount && (
                <div className="stat-item">
                  <span>👁️</span>
                  <span>{analysisResult.viewCount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="history-section">
          <button className="history-button">
            <span>�</span>
            <span>HISTORY</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-container">
          <BelajarBotSidebar
            videoTitle={analysisResult.title || 'Video Tanpa Judul'}
            sessionId={analysisResult.sessionId}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
