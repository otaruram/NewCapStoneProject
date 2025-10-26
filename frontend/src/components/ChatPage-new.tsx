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
  return (
    <div className="chat-page">
      {/* Simple Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="back-button" onClick={onBackClick}>
            &larr; Kembali
          </button>
        </div>

        <div className="sidebar-content">
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

          <div className="history-section">
            <button className="history-button">
              <span>🕒</span>
              <span>HISTORY</span>
            </button>
          </div>
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
