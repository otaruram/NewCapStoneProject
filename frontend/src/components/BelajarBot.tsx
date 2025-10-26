import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Send, Play } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

interface ChatBotProps {
  videoTitle?: string;
  onClose: () => void;
  onMinimize: () => void;
  sessionId?: string;
}

const BelajarBot: React.FC<ChatBotProps> = ({ videoTitle = 'Video Yang Dianalisis', onClose, onMinimize }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Hai! Aku Siti Khadijah, AI assistant yang siap membantumu memahami video ini. Mau tanya apa tentang video yang sudah dianalisis?' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const chatBodyRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text: string = newMessage) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setNewMessage('');
    setIsTyping(true);
    setShowQuickActions(false);
    
    // Simulate bot thinking
    setTimeout(() => {
      generateBotResponse(text);
    }, 1500);
  };

  const generateBotResponse = (userMessage: string) => {
    let botResponse: ChatMessage = { sender: 'bot', text: '' };
    
    // Simple response logic based on keywords
    if (userMessage.toLowerCase().includes('rangkum') || userMessage.toLowerCase() === 'buat rangkuman') {
      botResponse.text = 'Berikut adalah rangkuman video ini:\n\n' +
        'Video ini membahas tentang proses terbentuknya gunung berapi dan bagaimana letusan terjadi. ' +
        'Diawali dengan penjelasan tentang tektonik lempeng, video menjelaskan bagaimana magma terbentuk ' +
        'dan bergerak ke permukaan bumi. Letusan gunung berapi dikategorikan menjadi dua jenis utama: ' +
        'letusan eksplosif dan efusif. Video ini juga membahas dampak letusan terhadap lingkungan dan iklim global.';
    } 
    else if (userMessage.toLowerCase().includes('poin') || userMessage.toLowerCase() === 'apa 3 poin utama?') {
      botResponse.text = 'Tentu! Berikut adalah 3 poin utama dari video ini:\n\n' +
        '• Proses magma naik ke permukaan bumi.\n' +
        '• Perbedaan antara letusan eksplosif dan efusif (dijelaskan di 03:45).\n' +
        '• Dampak letusan terhadap iklim global.\n\n' +
        'Ada lagi yang ingin kamu tanyakan lebih detail?';
      botResponse.timestamp = '03:45';
    }
    else if (userMessage.toLowerCase().includes('istilah') || userMessage.toLowerCase() === 'jelaskan istilah penting') {
      botResponse.text = 'Berikut beberapa istilah penting yang disebutkan dalam video:\n\n' +
        '• Magma: Batuan cair panas di dalam bumi\n' +
        '• Lava: Magma yang telah mencapai permukaan\n' +
        '• Letusan Eksplosif: Letusan yang bersifat ledakan (dijelaskan di 02:15)\n' +
        '• Letusan Efusif: Letusan yang bersifat mengalir (dijelaskan di 03:45)\n' +
        '• Piroklas: Material yang dihasilkan saat letusan';
      botResponse.timestamp = '02:15';
    }
    else {
      botResponse.text = 'Maaf, saya belum sepenuhnya memahami pertanyaan tersebut. Coba tanyakan tentang rangkuman video, poin utama, atau istilah penting dalam video.';
    }
    
    setIsTyping(false);
    setMessages(prev => [...prev, botResponse]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const jumpToTimestamp = (timestamp: string) => {
    console.log(`Jumping to timestamp: ${timestamp}`);
    // In a real implementation, this would communicate with the video player
    alert(`Video akan melompat ke waktu ${timestamp}`);
  };

  const formatMessageText = (text: string, timestamp?: string) => {
    // Replace newlines with <br>
    const textWithLineBreaks = text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));

    // If there's a timestamp in the message, make it clickable
    if (timestamp) {
      return (
        <div>
          {textWithLineBreaks}
          {timestamp && (
            <div className="belajarbot-timestamp" onClick={() => jumpToTimestamp(timestamp)}>
              <Play size={12} />
              <span>{timestamp}</span>
            </div>
          )}
        </div>
      );
    }

    return textWithLineBreaks;
  };

  return (
    <div className="belajarbot-container">
      {/* Header */}
      <div className="belajarbot-header">
        <div className="belajarbot-identity">
          <div className="belajarbot-avatar">
            <span role="img" aria-label="Robot">🤖</span>
          </div>
          <div className="belajarbot-info">
            <div className="belajarbot-name">Siti Khadijah</div>
            <div className="belajarbot-status">Aktif di video: "{videoTitle}"</div>
          </div>
        </div>
        <div className="belajarbot-controls">
          <button className="belajarbot-button" onClick={onMinimize}>
            <Minimize2 size={16} />
          </button>
          <button className="belajarbot-button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div className="belajarbot-body" ref={chatBodyRef}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`belajarbot-message ${message.sender === 'user' ? 'belajarbot-user' : 'belajarbot-bot'}`}
          >
            {message.sender === 'bot' && (
              <div className="belajarbot-avatar-small">
                <span role="img" aria-label="Robot">🤖</span>
              </div>
            )}
            <div className="belajarbot-bubble">
              {formatMessageText(message.text, message.timestamp)}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="belajarbot-message belajarbot-bot">
            <div className="belajarbot-avatar-small">
              <span role="img" aria-label="Robot">🤖</span>
            </div>
            <div className="belajarbot-bubble belajarbot-typing">
              <div className="belajarbot-typing-indicator">
                <div className="belajarbot-typing-dot"></div>
                <div className="belajarbot-typing-dot"></div>
                <div className="belajarbot-typing-dot"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="belajarbot-quick-actions">
          <button 
            className="belajarbot-quick-action"
            onClick={() => handleQuickAction('Buat Rangkuman')}
          >
            Buat Rangkuman
          </button>
          <button 
            className="belajarbot-quick-action"
            onClick={() => handleQuickAction('Apa 3 Poin Utama?')}
          >
            Apa 3 Poin Utama?
          </button>
          <button 
            className="belajarbot-quick-action"
            onClick={() => handleQuickAction('Jelaskan Istilah Penting')}
          >
            Jelaskan Istilah Penting
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="belajarbot-input">
        <input
          type="text"
          className="belajarbot-input-field"
          placeholder="Tanya apa saja tentang video ini..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="belajarbot-send-button"
          onClick={() => handleSendMessage()}
          disabled={!newMessage.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default BelajarBot;
