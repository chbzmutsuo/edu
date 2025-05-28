'use server'

import prisma from '@lib/prisma'
import {PrismaClient} from '@prisma/client'

export const getPrismaClient = async () => {
  return prisma as PrismaClient
}
