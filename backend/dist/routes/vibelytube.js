"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const youtubeService_1 = require("../services/youtubeService");
const chatService_1 = require("../services/chatService");
const router = express_1.default.Router();
let youtubeService;
let chatService;
function initializeServices() {
    if (!youtubeService) {
        console.log('🔄 Initializing services with environment variables...');
        youtubeService = new youtubeService_1.YouTubeService();
        chatService = new chatService_1.ChatService();
    }
}
const sessions = new Map();
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/', 'video/', 'application/pdf', 'text/'];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
        if (isAllowed) {
            cb(null, true);
        }
        else {
            cb(new Error('File type not supported'));
        }
    }
});
router.post('/analyze', async (req, res) => {
    try {
        initializeServices();
        const { url, sessionId } = req.body;
        if (!url || !sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: url, sessionId'
            });
        }
        console.log(`📺 Starting YouTube analysis: ${url}`);
        const analysis = await youtubeService.analyzeVideo(url);
        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, { conversationHistory: [], analyses: [] });
            console.log(`🆕 Created new session: ${sessionId}`);
        }
        const session = sessions.get(sessionId);
        const analysisId = `analysis_${Date.now()}`;
        const analysisData = {
            id: analysisId,
            ...analysis,
            analyzedAt: new Date().toISOString()
        };
        session.analyses.push(analysisData);
        console.log(`💾 Stored analysis in session:`);
        console.log(`   - Analysis ID: ${analysisId}`);
        console.log(`   - Video title: ${analysis.title}`);
        console.log(`   - Transcript length: ${analysis.transcript?.length || 0}`);
        console.log(`   - Total analyses in session: ${session.analyses.length}`);
        console.log(`✅ YouTube analysis completed for session: ${sessionId}`);
        console.log(`📊 Analysis result - Title: ${analysis.title}`);
        const responseData = {
            id: analysisId,
            title: analysis.title,
            description: analysis.description,
            duration: analysis.duration,
            viewCount: analysis.viewCount,
            likeCount: analysis.likeCount,
            channelTitle: analysis.channelTitle,
            transcript: analysis.transcript,
            thumbnailUrl: analysis.thumbnailUrl,
            url: analysis.url,
            processedAt: new Date().toISOString()
        };
        console.log(`🚀 Sending response to frontend with title: ${responseData.title}`);
        res.json({
            success: true,
            data: responseData
        });
    }
    catch (error) {
        console.error('❌ YouTube analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during YouTube analysis',
            details: error.message
        });
    }
});
router.post('/chat', async (req, res) => {
    try {
        initializeServices();
        const { message, sessionId, analysisId } = req.body;
        if (!message || !sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: message, sessionId'
            });
        }
        console.log(`💬 Processing chat message for session: ${sessionId}`);
        console.log(`📄 Analysis ID provided: ${analysisId}`);
        console.log(`💭 User message: ${message}`);
        if (!sessions.has(sessionId)) {
            console.log(`🆕 Creating new session: ${sessionId}`);
            sessions.set(sessionId, { conversationHistory: [], analyses: [] });
        }
        const session = sessions.get(sessionId);
        let conversationHistory = session.conversationHistory || [];
        console.log(`📊 Session info:`);
        console.log(`   - Total analyses: ${session.analyses.length}`);
        console.log(`   - Available analysis IDs: [${session.analyses.map((a) => a.id).join(', ')}]`);
        console.log(`   - Looking for analysis ID: ${analysisId}`);
        if (session.videoType === 'uploaded') {
            console.log(`📁 Processing chat for uploaded video session`);
            const systemMessage = {
                role: 'system',
                content: `Kamu adalah Cecep, chatbot yang santai dan casual. Kamu sedang membahas video yang diupload user:

File: ${session.fileInfo.originalName}
Ukuran: ${Math.round(session.fileInfo.fileSize / (1024 * 1024))}MB
Tipe: ${session.fileInfo.mimeType}

${session.videoAnalysis || 'Video lokal yang baru saja diupload oleh user.'}

PENTING: Gunakan kepribadian Cecep yang santai, casual, dan ramah. Gunakan bahasa gaul Indonesia. Karena ini adalah video lokal yang diupload, kamu bisa membantu user dengan pertanyaan umum tentang video, memberikan saran editing, atau membahas hal-hal teknis. Bersikaplah helpful dan friendly!`
            };
            if (!conversationHistory.some((msg) => msg.role === 'system' && msg.content.includes(session.fileInfo.originalName))) {
                conversationHistory.unshift(systemMessage);
                console.log(`✅ Added system message for uploaded video`);
            }
        }
        else if (analysisId) {
            console.log(`📄 Including analysis context: ${analysisId}`);
            console.log(`📊 Session analyses count: ${session.analyses?.length || 0}`);
            let analysis = session.analyses?.find((a) => a.id === analysisId);
            if (!analysis && session.analyses && session.analyses.length > 0) {
                analysis = session.analyses[session.analyses.length - 1];
                console.log(`🔄 Using latest analysis as fallback: ${analysis.id}`);
            }
            console.log(`🔍 Found analysis: ${!!analysis}`);
            if (analysis) {
                console.log(`📹 Video title: ${analysis.title}`);
                console.log(`📝 Transcript length: ${analysis.transcript?.length || 0}`);
                const systemMessage = {
                    role: 'system',
                    content: `Kamu adalah Cecep, chatbot yang santai dan casual. Kamu sedang membahas video YouTube berikut:
          
Judul: ${analysis.title}
Channel: ${analysis.channelTitle || 'Tidak diketahui'}
Durasi: ${analysis.duration}
Deskripsi: ${analysis.description || 'Tidak ada deskripsi'}

${analysis.transcript ? `Transkrip lengkap video:
${analysis.transcript}` : 'Transkrip tidak tersedia.'}

PENTING: Gunakan kepribadian Cecep yang santai, casual, dan ramah. Gunakan bahasa gaul Indonesia dan jawab berdasarkan konten video di atas. Jangan gunakan fallback response umum. Selalu merujuk ke isi video yang sudah kamu analisis.`
                };
                console.log(`📋 System message content preview: ${systemMessage.content.substring(0, 200)}...`);
                if (!conversationHistory.some((msg) => msg.role === 'system' && msg.content.includes(analysis.title))) {
                    conversationHistory.unshift(systemMessage);
                    console.log(`✅ Added system message to conversation`);
                }
                else {
                    console.log(`⚠️ System message already exists in conversation`);
                }
            }
            else {
                console.log(`❌ Analysis not found in session. Available analyses:`, session.analyses.map((a) => a.id));
            }
        }
        else {
            console.log(`⚠️ No analysisId provided in chat request`);
        }
        const userMessage = { role: 'user', content: message };
        conversationHistory.push(userMessage);
        const aiResponse = await chatService.generateResponse(conversationHistory);
        const assistantMessage = { role: 'assistant', content: aiResponse };
        conversationHistory.push(assistantMessage);
        session.conversationHistory = conversationHistory;
        console.log(`✅ Chat response generated for session: ${sessionId}`);
        res.json({
            success: true,
            data: {
                response: aiResponse,
                conversationHistory: conversationHistory.filter((msg) => msg.role !== 'system')
            }
        });
    }
    catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during chat',
            details: error.message
        });
    }
});
router.get('/session/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }
        const conversationHistory = session.conversationHistory || [];
        res.json({
            success: true,
            data: {
                sessionId,
                conversationHistory: conversationHistory.filter((msg) => msg.role !== 'system')
            }
        });
    }
    catch (error) {
        console.error('❌ Session info error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/session', (req, res) => {
    try {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessions.set(sessionId, {
            conversationHistory: [],
            analyses: [],
            createdAt: new Date().toISOString()
        });
        res.json({
            success: true,
            data: {
                sessionId
            }
        });
    }
    catch (error) {
        console.error('❌ Error creating session:', error.message);
        res.status(500).json({
            success: false,
            error: 'Gagal membuat session',
            details: error.message
        });
    }
});
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'Intinya aja dongs Backend',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
router.post('/upload', upload.single('video'), async (req, res) => {
    try {
        initializeServices();
        const { sessionId } = req.body;
        const uploadedFile = req.file;
        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                error: 'No video file uploaded'
            });
        }
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID is required'
            });
        }
        console.log(`📁 Processing uploaded video: ${uploadedFile.originalname}`);
        console.log(`📋 Session ID: ${sessionId}`);
        const fileInfo = {
            originalName: uploadedFile.originalname,
            fileName: uploadedFile.filename,
            filePath: uploadedFile.path,
            fileSize: uploadedFile.size,
            mimeType: uploadedFile.mimetype,
            uploadedAt: new Date().toISOString()
        };
        let videoAnalysis = '';
        let transcription = null;
        const fileSizeMB = Math.round(uploadedFile.size / (1024 * 1024));
        videoAnalysis = `Video lokal "${uploadedFile.originalname}" telah diupload dengan ukuran ${fileSizeMB}MB. `;
        if (uploadedFile.mimetype.includes('video')) {
            videoAnalysis += 'Ini adalah file video yang dapat diputar. ';
        }
        videoAnalysis += 'Anda dapat menanyakan apa saja tentang video ini kepada saya, meskipun analisis mendalam memerlukan pemrosesan lebih lanjut.';
        sessions.set(sessionId, {
            sessionId,
            videoType: 'uploaded',
            fileInfo,
            videoAnalysis,
            transcription,
            messages: [],
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        });
        console.log(`✅ File uploaded and analyzed: ${uploadedFile.originalname}`);
        res.json({
            success: true,
            data: {
                sessionId,
                fileName: uploadedFile.originalname,
                fileSize: uploadedFile.size,
                analysis: videoAnalysis,
                transcription: transcription,
                message: 'Video uploaded successfully. You can now chat about this video.'
            }
        });
    }
    catch (error) {
        console.error('❌ Error in upload endpoint:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.default = router;
//# sourceMappingURL=vibelytube.js.map