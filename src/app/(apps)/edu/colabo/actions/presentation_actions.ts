'use server'

import prisma from 'src/lib/prisma'
import {revalidatePath} from 'next/cache'

export const presentation_actions = {
  async setActiveSlide(gameId, slideId) {
    await prisma.$transaction(async tx => {
      // Set all slides in this game to inactive
      await tx.slide.updateMany({
        where: {gameId: parseInt(gameId)},
        data: {isActive: false},
      })

      // Set the selected slide to active
      if (slideId) {
        await tx.slide.update({
          where: {id: parseInt(slideId)},
          data: {isActive: true},
        })
      }
    })

    revalidatePath('/edu/colabo/presentation')
  },

  async shareResponse(responseId) {
    // For now, just mark this action
    // In a real implementation, you might want to store which responses are shared
    // or send real-time updates to students

    const response = await prisma.slideResponse.findUnique({
      where: {id: parseInt(responseId)},
      include: {
        Student: true,
        Slide: true,
      },
    })

    if (!response) {
      throw new Error('Response not found')
    }

    // Here you could implement WebSocket/SSE to push the shared response to students
    // For now, we'll just return the response

    revalidatePath('/edu/colabo/presentation')
    return response
  },

  async getGameStatus(gameId) {
    const game = await prisma.game.findUnique({
      where: {id: parseInt(gameId)},
      include: {
        Slide: {
          where: {isActive: true},
          include: {
            SlideBlock: {
              orderBy: {sortOrder: 'asc'},
            },
          },
        },
        GameStudent: {
          include: {
            Student: true,
          },
        },
      },
    })

    const activeSlide = game?.Slide?.[0] || null
    const totalStudents = game?.GameStudent?.length || 0

    let responseCount = 0
    if (activeSlide) {
      responseCount = await prisma.slideResponse.count({
        where: {slideId: activeSlide.id},
      })
    }

    return {
      game,
      activeSlide,
      totalStudents,
      responseCount,
      responseRate: totalStudents > 0 ? Math.round((responseCount / totalStudents) * 100) : 0,
    }
  },

  async addStudentToGame(gameId, studentId) {
    // Check if student is already in the game
    const existingGameStudent = await prisma.gameStudent.findFirst({
      where: {
        gameId: parseInt(gameId),
        studentId: parseInt(studentId),
      },
    })

    if (existingGameStudent) {
      return existingGameStudent
    }

    // Add student to game
    const gameStudent = await prisma.gameStudent.create({
      data: {
        gameId: parseInt(gameId),
        studentId: parseInt(studentId),
      },
      include: {
        Student: {
          include: {
            Classroom: true,
          },
        },
      },
    })

    revalidatePath('/edu/colabo/presentation')
    return gameStudent
  },

  async removeStudentFromGame(gameId, studentId) {
    await prisma.gameStudent.deleteMany({
      where: {
        gameId: parseInt(gameId),
        studentId: parseInt(studentId),
      },
    })

    // Also remove their responses
    await prisma.slideResponse.deleteMany({
      where: {
        gameId: parseInt(gameId),
        studentId: parseInt(studentId),
      },
    })

    revalidatePath('/edu/colabo/presentation')
  },

  async generateQRCode(secretKey) {
    // Generate QR code data for student access
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const gameUrl = `${baseUrl}/edu/colabo/presentation/${secretKey}?as=student`

    return {
      url: gameUrl,
      qrData: gameUrl,
    }
  },

  async getStudentAccess(secretKey, studentCode) {
    // Find game by secret key
    const game = await prisma.game.findUnique({
      where: {secretKey},
      include: {
        School: true,
      },
    })

    if (!game) {
      throw new Error('Game not found')
    }

    // Find student by code within the school
    const student = await prisma.student.findFirst({
      where: {
        attendanceNumber: parseInt(studentCode),
        schoolId: game.schoolId,
      },
      include: {
        Classroom: true,
      },
    })

    if (!student) {
      throw new Error('Student not found')
    }

    // Add student to game if not already added
    await this.addStudentToGame(game.id, student.id)

    return {
      game,
      student,
    }
  },

  async endGame(gameId) {
    await prisma.game.update({
      where: {id: parseInt(gameId)},
      data: {
        status: 'completed',
        updatedAt: new Date(),
      },
    })

    // Set all slides to inactive
    await prisma.slide.updateMany({
      where: {gameId: parseInt(gameId)},
      data: {isActive: false},
    })

    revalidatePath('/edu/colabo/presentation')
  },
}
