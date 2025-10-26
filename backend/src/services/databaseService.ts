import prisma from '../lib/prisma'
import { ChatMessage } from './sessionService'

export interface CreateVideoData {
  youtubeId: string
  title: string
  description?: string
  thumbnail?: string
  duration?: number
  url: string
}

export interface CreateChatData {
  videoId: string
  sessionId: string
  message: string
  response?: string
}

export class DatabaseService {

  /**
   * Video Management
   */
  async createOrUpdateVideo(data: CreateVideoData) {
    try {
      const video = await prisma.video.upsert({
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
      })
      console.log(`🎥 Video created/updated: ${video.title}`)
      return video
    } catch (error) {
      console.error('Error creating/updating video:', error)
      throw error
    }
  }

  async getVideoByYouTubeId(youtubeId: string) {
    try {
      return await prisma.video.findUnique({
        where: { youtubeId },
        include: {
          chats: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
    } catch (error) {
      console.error('Error finding video by YouTube ID:', error)
      throw error
    }
  }

  async getVideoById(id: string) {
    try {
      return await prisma.video.findUnique({
        where: { id },
        include: {
          chats: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })
    } catch (error) {
      console.error('Error finding video by id:', error)
      throw error
    }
  }

  async getAllVideos(limit: number = 20) {
    try {
      return await prisma.video.findMany({
        include: {
          chats: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })
    } catch (error) {
      console.error('Error finding videos:', error)
      throw error
    }
  }

  /**
   * Chat Management
   */
  async createChat(data: CreateChatData) {
    try {
      const chat = await prisma.chat.create({
        data,
        include: {
          video: true
        }
      })
      console.log(`💬 Chat created for video: ${chat.videoId}`)
      return chat
    } catch (error) {
      console.error('Error creating chat:', error)
      throw error
    }
  }

  async getVideoChats(videoId: string, limit: number = 20) {
    try {
      return await prisma.chat.findMany({
        where: { videoId },
        include: {
          video: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })
    } catch (error) {
      console.error('Error finding video chats:', error)
      throw error
    }
  }

  async getSessionChats(sessionId: string, limit: number = 50) {
    try {
      return await prisma.chat.findMany({
        where: { sessionId },
        include: {
          video: true
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: limit
      })
    } catch (error) {
      console.error('Error finding session chats:', error)
      throw error
    }
  }

  async getStats() {
    try {
      const [videoCount, chatCount] = await Promise.all([
        prisma.video.count(),
        prisma.chat.count()
      ])

      // Get unique session count from chats
      const uniqueSessions = await prisma.chat.groupBy({
        by: ['sessionId'],
        _count: true
      })

      return {
        videos: videoCount,
        chats: chatCount,
        sessions: uniqueSessions.length
      }
    } catch (error) {
      console.error('Error getting stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()
