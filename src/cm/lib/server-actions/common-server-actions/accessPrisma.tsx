'use server'
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {prismaMethodType, PrismaModelNames} from '@cm/types/prisma-types'
import prisma from '@lib/prisma'
import {PrismaClient} from '@prisma/client'

export const foo = async <T extends PrismaModelNames, M extends prismaMethodType>(
  model: T,
  method: M,
  // @ts-ignore
  args: Parameters<PrismaClient[T][M]>[0]
): Promise<void> => {
  const modelClient = prisma[model] as any

  return await modelClient[method](args)
}
