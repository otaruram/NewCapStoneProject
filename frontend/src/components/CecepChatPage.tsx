import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageCircle, Brain, Zap } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'cecep';
  content: string;
  timestamp: Date;
}

interface CecepChatPageProps {
  onBackClick: () => void;
  initialVideoData?: {
    sessionId?: string;
    analysisId?: string;
    id?: string;
    title?: string;
    thumbnail?: string;
  };
}

const CecepChatPage: React.FC<CecepChatPageProps> = ({ onBackClick, initialVideoData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'cecep',
      content: 'Halo! Gue Cecep, AI yang siap bantuin lo memahami video ini. Tanya aja apa yang mau lo ketahui! 🤖✨',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const requestData = {
        message: inputMessage,
        sessionId: initialVideoData?.sessionId || '1759164479530',
        analysisId: initialVideoData?.analysisId || initialVideoData?.id || 'analysis_1759164362549',
        chatbot: 'cecep'
      };
      
      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.data?.response || data.response || 'Eh bro, gue lagi bingung nih. Coba tanya yang lain deh!';
        
        const cecepMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'cecep',
          content: aiResponse,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, cecepMessage]);
      } else {
        throw new Error('Backend response failed');
      }
    } catch (error) {
      const fallbackResponses = [
        `Wah bro, gue lagi ada masalah teknis nih. Tapi soal "${inputMessage}" yang lo tanya, menarik banget sih! Coba tanya lagi nanti ya.`,
        `Eh, koneksi gue lagi bermasalah nih. Tapi gue denger lo tanya tentang "${inputMessage}" - santai aja, nanti gue jawab lebih detail!`,
        `Aduh bro, sistem gue lagi lemot. Yang lo bilang tentang "${inputMessage}" itu bagus banget, coba ulang lagi deh!`,
        `Wkwk, gue lagi loading nih bro. Tapi "${inputMessage}" yang lo tanya itu keren, tunggu sebentar ya!`
      ];
      
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const cecepMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'cecep',
        content: randomFallback,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, cecepMessage]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      height: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Inline CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        @keyframes messageSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
          50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.8), 0 0 40px rgba(118, 75, 162, 0.6); }
        }
        
        @keyframes backgroundFloat {
          0%, 100% { transform: translateX(-50px) translateY(-30px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateX(50px) translateY(30px) rotate(180deg); opacity: 0.3; }
        }
        
        .message-enter {
          animation: messageSlide 0.3s ease-out;
        }
        
        .typing-dot {
          animation: typing 1.4s ease-in-out infinite;
        }
        
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* Minimal Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '40px',
        height: '40px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '50%'
      }} />
      
      <div style={{
        position: 'absolute',
        top: '70%',
        right: '8%',
        width: '30px',
        height: '30px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '50%'
      }} />

      {/* Header */}
      <div style={{
        background: '#1a1a1a',
        padding: '1rem 2rem',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <button 
          onClick={onBackClick}
          style={{
            background: '#2a2a2a',
            color: '#ccc',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '0.6rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#333';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2a2a2a';
            e.currentTarget.style.color = '#ccc';
          }}
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flex: 1
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: '#2a2a2a',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              color: '#888',
              border: '1px solid #444',
              overflow: 'hidden'
            }}>
              <img 
                src="/p.jpeg" 
                alt="Cecep AI" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '🤖';
                }}
              />
            </div>
          </div>
          
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Cecep AI
            </h2>
            <p style={{
              margin: 0,
              color: '#6B7280',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Brain size={16} />
              AI Assistant yang Cerdas & Asik
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          background: 'rgba(255, 255, 255, 0.05)'
        }}
      >
        {messages.map((message, index) => (
          <div 
            key={message.id}
            className="message-enter"
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div style={{
              maxWidth: '70%',
              background: message.sender === 'user' 
                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                : 'rgba(255, 255, 255, 0.95)',
              color: message.sender === 'user' ? 'white' : '#374151',
              padding: '1.2rem 1.5rem',
              borderRadius: message.sender === 'user' 
                ? '20px 20px 5px 20px'
                : '20px 20px 20px 5px',
              boxShadow: message.sender === 'user'
                ? '0 8px 25px rgba(102, 126, 234, 0.4)'
                : '0 8px 25px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(20px)',
              border: message.sender === 'cecep' ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
              position: 'relative'
            }}>
              {message.sender === 'cecep' && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem'
                }}>
                  <Zap size={16} style={{ color: '#667eea' }} />
                </div>
              )}
              
              <div style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                marginBottom: '0.5rem'
              }}>
                {message.content}
              </div>
              
              <div style={{
                fontSize: '0.75rem',
                opacity: 0.7,
                textAlign: 'right'
              }}>
                {message.timestamp.toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: '1.2rem 1.5rem',
              borderRadius: '20px 20px 20px 5px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                Cecep sedang berpikir
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div className="typing-dot" style={{
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  borderRadius: '50%'
                }} />
                <div className="typing-dot" style={{
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  borderRadius: '50%'
                }} />
                <div className="typing-dot" style={{
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  borderRadius: '50%'
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tanyakan sesuatu tentang video ini..."
              style={{
                width: '100%',
                minHeight: '60px',
                maxHeight: '120px',
                padding: '1rem 1.5rem',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                borderRadius: '20px',
                fontSize: '1rem',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
              }}
            />
            
            <MessageCircle 
              size={20} 
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                color: '#9CA3AF',
                pointerEvents: 'none'
              }} 
            />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            style={{
              background: inputMessage.trim() && !isTyping 
                ? 'linear-gradient(135deg, #667eea, #764ba2)'
                : '#E5E7EB',
              color: inputMessage.trim() && !isTyping ? 'white' : '#9CA3AF',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: inputMessage.trim() && !isTyping 
                ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
              animation: inputMessage.trim() && !isTyping ? 'glow 3s ease-in-out infinite' : 'none'
            }}
            onMouseEnter={(e) => {
              if (inputMessage.trim() && !isTyping) {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CecepChatPage;