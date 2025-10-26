import express, { Request, Response } from 'express';
import multer from 'multer';
import { YouTubeService } from '../services/youtubeService';
import { ChatService } from '../services/chatService';
import { requireAuth, checkDeviceLimit } from './auth';
import prisma from '../lib/prisma';

const router = express.Router();

// Lazy initialization of services (after env vars are loaded)
let youtubeService: YouTubeService;
let chatService: ChatService;

function initializeServices() {
  if (!youtubeService) {
    console.log('🔄 Initializing services with environment variables...');
    youtubeService = new YouTubeService();
    chatService = new ChatService();
  }
}

// In-memory session storage (for development)
const sessions = new Map<string, any>();

// Setup multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio, video, and document files
    const allowedTypes = ['audio/', 'video/', 'application/pdf', 'text/'];
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  }
});

// Check daily analysis limit
const checkDailyLimit = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const user = req.user as any;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create daily credit record
    let dailyCredit = await prisma.$queryRaw`
      SELECT * FROM daily_credits WHERE "userId" = ${user.id} AND date = ${today}
    ` as any[];

    if (dailyCredit.length === 0) {
      // Create new daily credit record
      await prisma.$executeRaw`
        INSERT INTO daily_credits (id, "userId", date, "analysisCount", "maxAnalysis", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${user.id}, ${today}, 0, 2, NOW(), NOW())
      `;
      return next();
    }

    const credit = dailyCredit[0];
    if (credit.analysisCount >= credit.maxAnalysis) {
      return res.status(403).json({
        error: 'Daily limit exceeded',
        message: `Anda telah mencapai batas analisis harian (${credit.maxAnalysis} analisis per hari)`,
        currentCount: credit.analysisCount,
        maxCount: credit.maxAnalysis,
        resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      });
    }

    next();
  } catch (error) {
    console.error('Daily limit check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/vibelytube/analyze
 * Analyze YouTube video and save analysis
 */
router.post('/analyze', requireAuth, checkDeviceLimit, checkDailyLimit, async (req: Request, res: Response) => {
  try {
    // Initialize services with loaded environment variables
    initializeServices();
    
    const { url, sessionId } = req.body;
    
    if (!url || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: url, sessionId'
      });
    }
    
    console.log(`📺 Starting YouTube analysis: ${url}`);
    
    // Get user statistics
router.get('/user/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const deviceId = (req.headers['x-device-id'] as string) || req.ip || 'unknown';
    
    // Count total analyses by user
    const totalAnalyses = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM analyses WHERE "userId" = ${user.id}
    ` as any[];
    
    const count = parseInt(totalAnalyses[0]?.count || '0');
    
    // Get device usage info
    const deviceUsage = await prisma.deviceUsage.findFirst({
      where: {
        userId: user.id,
        deviceId: deviceId
      }
    });
    
    // Get daily credit info
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyCredit = await prisma.$queryRaw`
      SELECT * FROM daily_credits WHERE "userId" = ${user.id} AND date = ${today}
    ` as any[];
    
    const creditInfo = dailyCredit.length > 0 ? {
      used: dailyCredit[0].analysisCount,
      max: dailyCredit[0].maxAnalysis,
      remaining: Math.max(0, dailyCredit[0].maxAnalysis - dailyCredit[0].analysisCount),
      resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
    } : {
      used: 0,
      max: 2,
      remaining: 2,
      resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    const usageInfo = {
      currentUsage: deviceUsage?.usageCount || 0,
      maxUsage: 3,
      remainingUsage: Math.max(0, 3 - (deviceUsage?.usageCount || 0)),
      isAtLimit: (deviceUsage?.usageCount || 0) >= 3
    };
    
    res.json({
      success: true,
      data: {
        totalAnalyses: count,
        userId: user.id,
        userName: user.name,
        deviceUsage: usageInfo,
        dailyCredits: creditInfo
      }
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    });
  }
});

// Remove duplicate checkDailyLimit function using comprehensive pipeline
    const analysis = await youtubeService.analyzeVideo(url);
    
    // Store analysis in session
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
    
    // Save analysis to database for authenticated users
    const user = req.user as any;
    if (user && user.id) {
      try {
        // Extract YouTube ID from URL
        const youtubeId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || 'unknown';
        
        // Convert duration string to seconds
        const durationInSeconds = analysis.duration ? parseInt(analysis.duration.toString()) : null;
        
        // First, create or get the video record
        const video = await prisma.video.upsert({
          where: { youtubeId: youtubeId },
          update: {
            title: analysis.title,
            description: analysis.description,
            thumbnail: analysis.thumbnailUrl,
            duration: durationInSeconds,
            url: url
          },
          create: {
            youtubeId: youtubeId,
            title: analysis.title,
            description: analysis.description,
            thumbnail: analysis.thumbnailUrl,
            duration: durationInSeconds,
            url: url
          }
        });

        // Create analysis record using raw SQL for now
        await prisma.$executeRaw`
          INSERT INTO analyses (id, "userId", "videoId", "sessionId", title, duration, "createdAt")
          VALUES (gen_random_uuid()::text, ${user.id}, ${video.id}, ${sessionId}, ${analysis.title}, ${durationInSeconds}, NOW())
        `;

        // Update daily credit count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await prisma.$executeRaw`
          INSERT INTO daily_credits (id, "userId", date, "analysisCount", "maxAnalysis", "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::text, ${user.id}, ${today}, 1, 2, NOW(), NOW())
          ON CONFLICT ("userId", date) DO UPDATE
          SET "analysisCount" = daily_credits."analysisCount" + 1,
              "updatedAt" = NOW()
          WHERE daily_credits."userId" = ${user.id} AND daily_credits.date = ${today}
        `;

        console.log(`📈 Saved analysis to database and updated daily credit for user: ${user.email}`);
      } catch (updateError) {
        console.error('⚠️ Failed to save analysis to database:', updateError);
      }
    }
    
        // Get updated credit count
        const updatedCredit = await prisma.$queryRaw`
          SELECT "analysisCount", "maxAnalysis"
          FROM daily_credits
          WHERE "userId" = ${user.id} AND date = ${today}
        `;

        const responseData = {
          id: analysisId,
          title: analysis.title,
          description: analysis.description,
          duration: analysis.duration,
          viewCount: analysis.viewCount,
          likeCount: analysis.likeCount,
          dailyCredits: {
            used: updatedCredit[0]?.analysisCount || 0,
            max: updatedCredit[0]?.maxAnalysis || 2,
            remaining: Math.max(0, (updatedCredit[0]?.maxAnalysis || 2) - (updatedCredit[0]?.analysisCount || 0))
          },
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
    
  } catch (error: any) {
    console.error('❌ YouTube analysis error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during YouTube analysis',
      details: error.message
    });
  }
});

/**
 * POST /api/vibelytube/chat
 * Send message and get AI response with analysis context
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    // Initialize services with loaded environment variables
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
    
    // Get or create session
    if (!sessions.has(sessionId)) {
      console.log(`🆕 Creating new session: ${sessionId}`);
      sessions.set(sessionId, { conversationHistory: [], analyses: [] });
    }

    const session = sessions.get(sessionId);
    let conversationHistory = session.conversationHistory || [];
    
    console.log(`📊 Session info:`);
    console.log(`   - Total analyses: ${session.analyses.length}`);
    console.log(`   - Available analysis IDs: [${session.analyses.map((a: any) => a.id).join(', ')}]`);
    console.log(`   - Looking for analysis ID: ${analysisId}`);
    
    // Check if this is an uploaded video session
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
      
      // Only add system message if it's not already there
      if (!conversationHistory.some((msg: any) => msg.role === 'system' && msg.content.includes(session.fileInfo.originalName))) {
        conversationHistory.unshift(systemMessage);
        console.log(`✅ Added system message for uploaded video`);
      }
    }
    // If there's an analysis ID, include the video data as context (for YouTube videos)
    else if (analysisId) {
      console.log(`📄 Including analysis context: ${analysisId}`);
      console.log(`📊 Session analyses count: ${session.analyses?.length || 0}`);
      
      // First try exact match, then try partial match for backwards compatibility
      let analysis = session.analyses?.find((a: any) => a.id === analysisId);
      
      // If no exact match, try to find by ID suffix or alternative matching
      if (!analysis && session.analyses && session.analyses.length > 0) {
        // Try last analysis if analysisId contains similar pattern
        analysis = session.analyses[session.analyses.length - 1];
        console.log(`🔄 Using latest analysis as fallback: ${analysis.id}`);
      }
      
      console.log(`🔍 Found analysis: ${!!analysis}`);
      
      if (analysis) {
        console.log(`📹 Video title: ${analysis.title}`);
        console.log(`📝 Transcript length: ${analysis.transcript?.length || 0}`);
        
        // Add system context about the video with Cecep personality
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
        
        // Only add system message if it's not already there
        if (!conversationHistory.some((msg: any) => msg.role === 'system' && msg.content.includes(analysis.title))) {
          conversationHistory.unshift(systemMessage);
          console.log(`✅ Added system message to conversation`);
        } else {
          console.log(`⚠️ System message already exists in conversation`);
        }
      } else {
        console.log(`❌ Analysis not found in session. Available analyses:`, session.analyses.map((a: any) => a.id));
      }
    } else {
      console.log(`⚠️ No analysisId provided in chat request`);
    }

    // Add user message to history
    const userMessage = { role: 'user', content: message };
    conversationHistory.push(userMessage);
    
    // Generate AI response
    const aiResponse = await chatService.generateResponse(conversationHistory);
    
    // Add AI response to history
    const assistantMessage = { role: 'assistant', content: aiResponse };
    conversationHistory.push(assistantMessage);
    
    // Update session with new conversation
    session.conversationHistory = conversationHistory;
    
    console.log(`✅ Chat response generated for session: ${sessionId}`);
    
    res.json({
      success: true,
      data: {
        response: aiResponse,
        conversationHistory: conversationHistory.filter((msg: any) => msg.role !== 'system')
      }
    });
    
  } catch (error: any) {
    console.error('❌ Chat error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during chat',
      details: error.message
    });
  }
});

/**
 * GET /api/vibelytube/session/:sessionId
 * Get session information
 */
router.get('/session/:sessionId', (req: Request, res: Response) => {
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
        conversationHistory: conversationHistory.filter((msg: any) => msg.role !== 'system')
      }
    });
    
  } catch (error: any) {
    console.error('❌ Session info error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/vibelytube/session
 * Create new session
 */
router.post('/session', (req: Request, res: Response) => {
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

  } catch (error: any) {
    console.error('❌ Error creating session:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Gagal membuat session',
      details: error.message
    });
  }
});

/**
 * GET /api/vibelytube/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Intinya aja dongs Backend',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/vibelytube/upload
 * Upload local video file for analysis
 */
router.post('/upload', upload.single('video'), async (req: Request, res: Response) => {
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

    // Store file information in session
    const fileInfo = {
      originalName: uploadedFile.originalname,
      fileName: uploadedFile.filename,
      filePath: uploadedFile.path,
      fileSize: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      uploadedAt: new Date().toISOString()
    };

    // Basic video analysis
    let videoAnalysis = '';
    let transcription = null;

    // Create basic analysis based on file properties
    const fileSizeMB = Math.round(uploadedFile.size / (1024 * 1024));
    videoAnalysis = `Video lokal "${uploadedFile.originalname}" telah diupload dengan ukuran ${fileSizeMB}MB. `;
    
    if (uploadedFile.mimetype.includes('video')) {
      videoAnalysis += 'Ini adalah file video yang dapat diputar. ';
    }
    
    videoAnalysis += 'Anda dapat menanyakan apa saja tentang video ini kepada saya, meskipun analisis mendalam memerlukan pemrosesan lebih lanjut.';

    // Initialize session with uploaded file info and basic analysis
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

  } catch (error) {
    console.error('❌ Error in upload endpoint:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;
