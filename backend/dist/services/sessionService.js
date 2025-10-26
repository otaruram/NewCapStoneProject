"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionManager = exports.SessionManager = void 0;
class SessionManager {
    constructor() {
        this.sessions = new Map();
    }
    getOrCreateSession(sessionId) {
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
    updateSessionMetadata(sessionId, metadata) {
        const session = this.getOrCreateSession(sessionId);
        session.metadata = { ...session.metadata, ...metadata };
        console.log(`🔄 Session metadata updated: ${sessionId}`);
    }
    addMessage(sessionId, message) {
        const session = this.getOrCreateSession(sessionId);
        message.timestamp = Date.now();
        session.messages.push(message);
        if (session.messages.length > 20) {
            session.messages = session.messages.slice(-20);
        }
        console.log(`💬 Message added to session ${sessionId}: ${message.role}`);
    }
    getConversationHistory(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return [];
        }
        const systemMessage = this.createSystemMessage(session);
        return [systemMessage, ...session.messages];
    }
    createSystemMessage(session) {
        let content = "Anda adalah asisten AI yang membantu menganalisis konten multimedia. Anda HARUS menggunakan informasi dari transcript atau ringkasan yang disediakan untuk menjawab pertanyaan pengguna.";
        if (session.metadata?.videoTitle) {
            content += ` Saat ini sedang membahas video: "${session.metadata.videoTitle}".`;
        }
        if (session.metadata?.fileName) {
            content += ` File yang dianalisis: "${session.metadata.fileName}".`;
        }
        if (session.metadata?.transcript) {
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
    cleanupOldSessions(maxAgeMs = 24 * 60 * 60 * 1000) {
        const now = Date.now();
        const toDelete = [];
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
    getSessionInfo(sessionId) {
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
exports.SessionManager = SessionManager;
exports.sessionManager = new SessionManager();
setInterval(() => {
    exports.sessionManager.cleanupOldSessions();
}, 60 * 60 * 1000);
//# sourceMappingURL=sessionService.js.map