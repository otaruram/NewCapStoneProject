import React, { useState, useRef, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

interface ChatBotSidebarProps {
  videoTitle?: string;
  sessionId?: string;
}

const BelajarBotSidebar: React.FC<ChatBotSidebarProps> = ({ 
  videoTitle = 'Video Yang Dianalisis', 
  sessionId 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      sender: 'bot', 
      text: 'Hai! Aku Siti Khadijah, AI assistant yang siap membantumu memahami video ini. Mau tanya apa tentang video yang sudah dianalisis?' 
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const chatBodyRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string = newMessage) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = { sender: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);
    setShowQuickActions(false);
    
    try {
      // Call API to backend
      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          videoTitle: videoTitle
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage: ChatMessage = {
        sender: 'bot',
        text: data.response || 'Maaf, aku tidak bisa memproses pertanyaan itu saat ini.',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        sender: 'bot',
        text: 'Maaf, terjadi kesalahan koneksi. Coba lagi nanti ya!',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageText = (text: string, timestamp?: string) => {
    const lines = text.split('\n');
    return (
      <div>
        {lines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        {timestamp && (
          <div className="message-timestamp">{timestamp}</div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Chat Messages */}
      <div className="chat-messages" ref={chatBodyRef}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.sender}`}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '15px'
            }}
          >
            <div style={{ 
              maxWidth: '75%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div className="message-header" style={{
                order: message.sender === 'user' ? 1 : 0,
                marginBottom: '5px'
              }}>
                <div className={`message-avatar ${message.sender}`}>
                  {message.sender === 'bot' ? 'SK' : 'U'}
                </div>
                <span className="message-sender">
                  {message.sender === 'bot' ? 'Siti Khadijah' : 'You'}
                </span>
              </div>
              <div className={`message-bubble ${message.sender}`}>
                {formatMessageText(message.text, message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message bot loading" style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '15px'
          }}>
            <div style={{ maxWidth: '75%' }}>
              <div className="message-header" style={{ marginBottom: '5px' }}>
                <div className="message-avatar bot">SK</div>
                <span className="message-sender">Siti Khadijah</span>
              </div>
              <div className="message-bubble bot">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && messages.length === 1 && (
          <div className="quick-actions">
            <button 
              className="quick-action-btn"
              onClick={() => handleQuickAction('Buat rangkuman video ini')}
            >
              📝 Buat Rangkuman
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => handleQuickAction('Apa 3 poin utama dari video ini?')}
            >
              🎯 3 Poin Utama
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => handleQuickAction('Jelaskan istilah-istilah penting dalam video')}
            >
              📚 Istilah Penting
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => handleQuickAction('Ada pertanyaan apa yang bisa kamu jawab tentang video ini?')}
            >
              ❓ Apa yang bisa ditanya?
            </button>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="chat-input-area">
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            placeholder="Tanya tentang video ini..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            style={{
              resize: 'none',
              overflow: 'hidden',
              minHeight: '20px',
              maxHeight: '100px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          <button 
            className="send-button"
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim() || isTyping}
          >
            {isTyping ? '⏳' : '🚀'}
          </button>
        </div>
      </div>
    </>
  );
};

export default BelajarBotSidebar;
