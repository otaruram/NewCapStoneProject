"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = exports.DatabaseService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class DatabaseService {
    async createOrUpdateVideo(data) {
        try {
            const video = await prisma_1.default.video.upsert({
                where: { youtubeId: data.youtubeId },
                update: {
                    title: data.title,
                    description: data.description,
                    thumbnail: data.thumbnail,
                    duration: data.duration,
                    url: data.url
                },
                create: data,
                include: {
                    chats: true
                }
            });
            console.log(`🎥 Video created/updated: ${video.title}`);
            return video;
        }
        catch (error) {
            console.error('Error creating/updating video:', error);
            throw error;
        }
    }
    async getVideoByYouTubeId(youtubeId) {
        try {
            return await prisma_1.default.video.findUnique({
                where: { youtubeId },
                include: {
                    chats: {
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error finding video by YouTube ID:', error);
            throw error;
        }
    }
    async getVideoById(id) {
        try {
            return await prisma_1.default.video.findUnique({
                where: { id },
                include: {
                    chats: {
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error finding video by id:', error);
            throw error;
        }
    }
    async getAllVideos(limit = 20) {
        try {
            return await prisma_1.default.video.findMany({
                include: {
                    chats: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });
        }
        catch (error) {
            console.error('Error finding videos:', error);
            throw error;
        }
    }
    async createChat(data) {
        try {
            const chat = await prisma_1.default.chat.create({
                data,
                include: {
                    video: true
                }
            });
            console.log(`💬 Chat created for video: ${chat.videoId}`);
            return chat;
        }
        catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    }
    async getVideoChats(videoId, limit = 20) {
        try {
            return await prisma_1.default.chat.findMany({
                where: { videoId },
                include: {
                    video: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit
            });
        }
        catch (error) {
            console.error('Error finding video chats:', error);
            throw error;
        }
    }
    async getSessionChats(sessionId, limit = 50) {
        try {
            return await prisma_1.default.chat.findMany({
                where: { sessionId },
                include: {
                    video: true
                },
                orderBy: {
                    createdAt: 'asc'
                },
                take: limit
            });
        }
        catch (error) {
            console.error('Error finding session chats:', error);
            throw error;
        }
    }
    async getStats() {
        try {
            const [videoCount, chatCount] = await Promise.all([
                prisma_1.default.video.count(),
                prisma_1.default.chat.count()
            ]);
            const uniqueSessions = await prisma_1.default.chat.groupBy({
                by: ['sessionId'],
                _count: true
            });
            return {
                videos: videoCount,
                chats: chatCount,
                sessions: uniqueSessions.length
            };
        }
        catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }
}
exports.DatabaseService = DatabaseService;
exports.databaseService = new DatabaseService();
//# sourceMappingURL=databaseService.js.map