'use server'

import prisma from '@cm/lib/prisma'
import {revalidatePath} from 'next/cache'

export const slide_actions = {
  async createSlide(data) {
    const {title, templateType, gameId, blocks = []} = data

    // Get max sort order for this game
    const maxOrderSlide = await prisma.slide.findFirst({
      where: {gameId: parseInt(gameId)},
      orderBy: {sortOrder: 'desc'},
      select: {sortOrder: true},
    })

    const sortOrder = (maxOrderSlide?.sortOrder || 0) + 1

    const slide = await prisma.slide.create({
      data: {
        title,
        templateType,
        gameId: parseInt(gameId),
        sortOrder,
        SlideBlock: {
          create: blocks.map((block, index) => ({
            blockType: block.blockType,
            content: block.content || null,
            imageUrl: block.imageUrl || null,
            linkUrl: block.linkUrl || null,
            alignment: block.alignment || 'left',
            verticalAlign: block.verticalAlign || 'top',
            textColor: block.textColor || null,
            backgroundColor: block.backgroundColor || null,
            fontWeight: block.fontWeight || 'normal',
            textDecoration: block.textDecoration || 'none',
            isCorrectAnswer: block.isCorrectAnswer || false,
            sortOrder: index,
          })),
        },
      },
      include: {
        SlideBlock: {
          orderBy: {sortOrder: 'asc'},
        },
      },
    })

    revalidatePath('/edu/colabo')
    return slide
  },

  async updateSlide(slideId, data) {
    const {title, templateType, blocks = []} = data

    // Update slide and replace all blocks
    const slide = await prisma.$transaction(async tx => {
      // Update slide
      const updatedSlide = await tx.slide.update({
        where: {id: parseInt(slideId)},
        data: {title, templateType},
      })

      // Delete existing blocks
      await tx.slideBlock.deleteMany({
        where: {slideId: parseInt(slideId)},
      })

      // Create new blocks
      if (blocks.length > 0) {
        await tx.slideBlock.createMany({
          data: blocks.map((block, index) => ({
            slideId: parseInt(slideId),
            blockType: block.blockType,
            content: block.content || null,
            imageUrl: block.imageUrl || null,
            linkUrl: block.linkUrl || null,
            alignment: block.alignment || 'left',
            verticalAlign: block.verticalAlign || 'top',
            textColor: block.textColor || null,
            backgroundColor: block.backgroundColor || null,
            fontWeight: block.fontWeight || 'normal',
            textDecoration: block.textDecoration || 'none',
            isCorrectAnswer: block.isCorrectAnswer || false,
            sortOrder: index,
          })),
        })
      }

      return updatedSlide
    })

    // Return slide with blocks
    const slideWithBlocks = await prisma.slide.findUnique({
      where: {id: parseInt(slideId)},
      include: {
        SlideBlock: {
          orderBy: {sortOrder: 'asc'},
        },
      },
    })

    revalidatePath('/edu/colabo')
    return slideWithBlocks
  },

  async deleteSlide(slideId) {
    await prisma.slide.delete({
      where: {id: parseInt(slideId)},
    })

    revalidatePath('/edu/colabo')
  },

  async duplicateSlide(slideId) {
    const originalSlide = await prisma.slide.findUnique({
      where: {id: parseInt(slideId)},
      include: {
        SlideBlock: {
          orderBy: {sortOrder: 'asc'},
        },
      },
    })

    if (!originalSlide) {
      throw new Error('Slide not found')
    }

    // Get max sort order for this game
    const maxOrderSlide = await prisma.slide.findFirst({
      where: {gameId: originalSlide.gameId},
      orderBy: {sortOrder: 'desc'},
      select: {sortOrder: true},
    })

    const sortOrder = (maxOrderSlide?.sortOrder || 0) + 1

    const duplicatedSlide = await prisma.slide.create({
      data: {
        title: `${originalSlide.title} (コピー)`,
        templateType: originalSlide.templateType,
        gameId: originalSlide.gameId,
        sortOrder,
        SlideBlock: {
          create: originalSlide.SlideBlock.map((block, index) => ({
            blockType: block.blockType,
            content: block.content,
            imageUrl: block.imageUrl,
            linkUrl: block.linkUrl,
            alignment: block.alignment,
            verticalAlign: block.verticalAlign,
            textColor: block.textColor,
            backgroundColor: block.backgroundColor,
            fontWeight: block.fontWeight,
            textDecoration: block.textDecoration,
            isCorrectAnswer: block.isCorrectAnswer,
            sortOrder: index,
          })),
        },
      },
      include: {
        SlideBlock: {
          orderBy: {sortOrder: 'asc'},
        },
      },
    })

    revalidatePath('/edu/colabo')
    return duplicatedSlide
  },

  async setActiveSlide(slideId, gameId) {
    await prisma.$transaction(async tx => {
      // Set all slides in this game to inactive
      await tx.slide.updateMany({
        where: {gameId: parseInt(gameId)},
        data: {isActive: false},
      })

      // Set the selected slide to active
      await tx.slide.update({
        where: {id: parseInt(slideId)},
        data: {isActive: true},
      })
    })

    revalidatePath('/edu/colabo')
  },

  async reorderSlides(slideIds) {
    await prisma.$transaction(async tx => {
      for (let i = 0; i < slideIds.length; i++) {
        await tx.slide.update({
          where: {id: parseInt(slideIds[i])},
          data: {sortOrder: i},
        })
      }
    })

    revalidatePath('/edu/colabo')
  },
}
