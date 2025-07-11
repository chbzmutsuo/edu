import {PrismaClient} from '@prisma/client'
// import {PrismaClient} from '../../prisma/generated/prisma'

// const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})

const globalForPrisma = global as unknown as {prisma: PrismaClient | undefined}
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
