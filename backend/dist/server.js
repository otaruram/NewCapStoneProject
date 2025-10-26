"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const vibelytube_1 = __importDefault(require("./routes/vibelytube"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const envPath = path_1.default.resolve(__dirname, '../.env');
console.log(`🔍 Loading .env from: ${envPath}`);
dotenv_1.default.config({ path: envPath });
console.log('🔍 Environment variables check:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NOT_FOUND',
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'NOT_FOUND',
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? `${process.env.YOUTUBE_API_KEY.substring(0, 15)}...` : 'NOT_FOUND'
});
console.log('🔍 Environment variables loaded:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL_EXISTS: !!process.env.OPENAI_BASE_URL
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
}
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.get('/', (req, res) => {
    res.json({
        message: 'VibelyTube Essential Backend - Intinya aja dongs!',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            stats: '/api/stats',
            vibelytube: '/api/vibelytube/*'
        },
        timestamp: new Date().toISOString()
    });
});
app.use('/api/vibelytube', vibelytube_1.default);
app.get('/api/health', async (req, res) => {
    try {
        const stats = await databaseService.getStats();
        res.json({
            status: 'OK',
            message: 'VibelyTube Essential Backend - Intinya aja dongs!',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                ...stats
            }
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await databaseService.getStats();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to get database stats',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.use((err, req, res, next) => {
    console.error('❌ Global error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await prisma_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Server terminated...');
    await prisma_1.default.$disconnect();
    process.exit(0);
});
async function startServer() {
    try {
        await prisma_1.default.$connect();
        console.log('🗄️ Database connected successfully');
        app.listen(PORT, () => {
            console.log('🚀 VibelyTube Essential Backend started');
            console.log(`📍 Server running on port ${PORT}`);
            console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
            console.log('💡 Intinya aja dongs - All the essentials!');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map