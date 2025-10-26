/**
 * Session management untuk chat conversations
 * Menyimpan history percakapan per session
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  metadata?: {
    videoTitle?: string;
    videoUrl?: string;
    fileName?: string;
    transcript?: string;
  };
}

export class SessionManager {
  private sessions: Map<string, ChatSession> = new Map();
  
  /**
   * Buat session baru atau ambil yang sudah ada
   */
  getOrCreateSession(sessionId: string): ChatSession {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      session = {
        sessionId,
        messages: [],
        metadata: {}
      };
      
      this.sessions.set(sessionId, session);
      console.log(`📝 New chat session created: ${sessionId}`);
    }
    
    return session;
  }
  
  /**
   * Update metadata session (info video/file)
   */
  updateSessionMetadata(sessionId: string, metadata: Partial<ChatSession['metadata']>) {
    const session = this.getOrCreateSession(sessionId);
    session.metadata = { ...session.metadata, ...metadata };
    
    console.log(`🔄 Session metadata updated: ${sessionId}`);
  }
  
  /**
   * Tambahkan pesan ke session
   */
  addMessage(sessionId: string, message: ChatMessage) {
    const session = this.getOrCreateSession(sessionId);
    
    message.timestamp = Date.now();
    session.messages.push(message);
    
    // Batasi history maksimal 20 pesan untuk performa
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }
    
    console.log(`💬 Message added to session ${sessionId}: ${message.role}`);
  }
  
  /**
   * Ambil history conversation untuk AI
   */
  getConversationHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return [];
    }
    
    // Buat system message berdasarkan metadata
    const systemMessage = this.createSystemMessage(session);
    
    return [systemMessage, ...session.messages];
  }
  
  /**
   * Buat system message berdasarkan context
   */
  private createSystemMessage(session: ChatSession): ChatMessage {
    let content = "Anda adalah asisten AI yang membantu menganalisis konten multimedia. Anda HARUS menggunakan informasi dari transcript atau ringkasan yang disediakan untuk menjawab pertanyaan pengguna.";
    
    if (session.metadata?.videoTitle) {
      content += ` Saat ini sedang membahas video: "${session.metadata.videoTitle}".`;
    }
    
    if (session.metadata?.fileName) {
      content += ` File yang dianalisis: "${session.metadata.fileName}".`;
    }
    
    if (session.metadata?.transcript) {
      // Use more transcript content to provide better context
      const truncatedTranscript = session.metadata.transcript.length > 2000 
        ? session.metadata.transcript.substring(0, 2000) + "..."
        : session.metadata.transcript;
        
      content += ` Berikut adalah ringkasan konten: "${truncatedTranscript}".`;
    }
    
    content += " PENTING: Semua jawaban Anda HARUS spesifik dan relevan dengan konten yang dianalisis. Gunakan informasi dari transcript untuk menjawab pertanyaan dengan detail yang tepat. Jangan berikan jawaban generik atau umum yang tidak berkaitan dengan konten video/file yang sedang dibahas.";
    
    return {
      role: 'system',
      content
    };
  }
  
  /**
   * Hapus session lama untuk menghemat memory
   */
  cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000) { // 24 jam
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.sessions.forEach((session, sessionId) => {
      const lastMessage = session.messages[session.messages.length - 1];
      
      if (lastMessage && lastMessage.timestamp && (now - lastMessage.timestamp) > maxAgeMs) {
        toDelete.push(sessionId);
      }
    });
    
    toDelete.forEach(sessionId => {
      this.sessions.delete(sessionId);
      console.log(`🗑️ Cleaned up old session: ${sessionId}`);
    });
    
    if (toDelete.length > 0) {
      console.log(`🧹 Cleaned up ${toDelete.length} old sessions`);
    }
  }
  
  /**
   * Ambil info session
   */
  getSessionInfo(sessionId: string) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    return {
      sessionId: session.sessionId,
      messageCount: session.messages.length,
      metadata: session.metadata,
      lastActivity: session.messages[session.messages.length - 1]?.timestamp
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Jalankan cleanup setiap jam
setInterval(() => {
  sessionManager.cleanupOldSessions();
}, 60 * 60 * 1000);
