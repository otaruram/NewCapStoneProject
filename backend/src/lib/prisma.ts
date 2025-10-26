import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Use DIRECT_URL for development to avoid pooling issues
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'development' && process.env.DIRECT_URL) {
    console.log('🔄 Using direct database connection for development')
    return process.env.DIRECT_URL
  }
  return process.env.DATABASE_URL
}

const prisma = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma
