import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient()
} catch (error) {
  console.warn('Failed to initialize Prisma client:', error)
  // Create a mock client for development when database is not available
  prisma = {
    // Add basic mock methods to prevent crashes
    $connect: async () => {},
    $disconnect: async () => {},
    // Add other methods as needed
  } as any
}

export { prisma }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
