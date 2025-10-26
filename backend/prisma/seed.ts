import { PrismaClient } from '@prisma/client'

// Use direct URL for seeding to avoid connection pooling issues
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
})

async function main() {
  console.log('🌱 Start seeding...')

  // Create sample user
  const user1 = await prisma.user.upsert({
    where: { email: 'demo@vibelytube.com' },
    update: {},
    create: {
      email: 'demo@vibelytube.com',
      name: 'Demo User',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=random'
    }
  })

  console.log(`👤 Created user: ${user1.email}`)

  // Create sample videos
  const sampleVideos = [
    {
      youtubeId: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
      description: 'The official video for "Never Gonna Give You Up" by Rick Astley',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: 212,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      userId: user1.id
    },
    {
      youtubeId: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      description: 'Official Music Video',
      thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
      duration: 282,
      url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      userId: user1.id
    }
  ]

  for (const videoData of sampleVideos) {
    const video = await prisma.video.upsert({
      where: { youtubeId: videoData.youtubeId },
      update: videoData,
      create: videoData
    })
    console.log(`🎥 Created video: ${video.title}`)

    // Create sample chats for each video
    await prisma.chat.create({
      data: {
        videoId: video.id,
        userId: user1.id,
        message: 'What is this video about?',
        response: 'This is a popular music video that has been viewed millions of times on YouTube.'
      }
    })

    await prisma.chat.create({
      data: {
        videoId: video.id,
        userId: user1.id,
        message: 'Can you tell me more about the artist?',
        response: 'This video features talented artists who have made significant contributions to the music industry.'
      }
    })

    console.log(`💬 Created sample chats for: ${video.title}`)
  }

  console.log('✅ Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
