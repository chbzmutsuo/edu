'use server'

import prisma from '@cm/lib/prisma'
import {revalidatePath} from 'next/cache'

export const response_actions = {
  async submitResponse(data) {
    const {
      slideId,
      studentId,
      gameId,
      responseType,
      choiceAnswer,
      textAnswer,
      curiocity1,
      curiocity2,
      curiocity3,
      curiocity4,
      curiocity5,
      efficacy1,
      efficacy2,
      efficacy3,
      efficacy4,
      efficacy5,
      lessonImpression,
      lessonSatisfaction,
      asSummary = false,
    } = data

    // Check if response already exists
    const existingResponse = await prisma.slideResponse.findFirst({
      where: {
        slideId: parseInt(slideId),
        studentId: parseInt(studentId),
        gameId: parseInt(gameId),
      },
    })

    let response
    if (existingResponse) {
      // Update existing response
      response = await prisma.slideResponse.update({
        where: {id: existingResponse.id},
        data: {
          responseType,
          choiceAnswer: choiceAnswer || null,
          textAnswer: textAnswer || null,
          curiocity1: curiocity1 || null,
          curiocity2: curiocity2 || null,
          curiocity3: curiocity3 || null,
          curiocity4: curiocity4 || null,
          curiocity5: curiocity5 || null,
          efficacy1: efficacy1 || null,
          efficacy2: efficacy2 || null,
          efficacy3: efficacy3 || null,
          efficacy4: efficacy4 || null,
          efficacy5: efficacy5 || null,
          updatedAt: new Date(),
        },
        include: {
          Student: true,
          Slide: true,
        },
      })
    } else {
      // Create new response
      response = await prisma.slideResponse.create({
        data: {
          slideId: parseInt(slideId),
          studentId: parseInt(studentId),
          gameId: parseInt(gameId),
          responseType,
          choiceAnswer: choiceAnswer || null,
          textAnswer: textAnswer || null,
          curiocity1: curiocity1 || null,
          curiocity2: curiocity2 || null,
          curiocity3: curiocity3 || null,
          curiocity4: curiocity4 || null,
          curiocity5: curiocity5 || null,
          efficacy1: efficacy1 || null,
          efficacy2: efficacy2 || null,
          efficacy3: efficacy3 || null,
          efficacy4: efficacy4 || null,
          efficacy5: efficacy5 || null,
        },
        include: {
          Student: true,
          Slide: true,
        },
      })
    }

    // If this is a psychology survey or summary, also create/update Answer record for compatibility
    if (responseType === 'psychology' || (responseType === 'summary' && asSummary)) {
      const existingAnswer = await prisma.answer.findFirst({
        where: {
          gameId: parseInt(gameId),
          studentId: parseInt(studentId),
          asSummary: asSummary,
        },
      })

      const answerData = {
        curiocity1: curiocity1 || null,
        curiocity2: curiocity2 || null,
        curiocity3: curiocity3 || null,
        curiocity4: curiocity4 || null,
        curiocity5: curiocity5 || null,
        efficacy1: efficacy1 || null,
        efficacy2: efficacy2 || null,
        efficacy3: efficacy3 || null,
        efficacy4: efficacy4 || null,
        efficacy5: efficacy5 || null,
        lessonImpression: lessonImpression || null,
        lessonSatisfaction: lessonSatisfaction || null,
        asSummary,
      }

      if (existingAnswer) {
        await prisma.answer.update({
          where: {id: existingAnswer.id},
          data: answerData,
        })
      } else {
        await prisma.answer.create({
          data: {
            ...answerData,
            gameId: parseInt(gameId),
            studentId: parseInt(studentId),
          },
        })
      }
    }

    revalidatePath('/edu/colabo/presentation')
    return response
  },

  async getSlideResponses(slideId) {
    const responses = await prisma.slideResponse.findMany({
      where: {slideId: parseInt(slideId)},
      include: {
        Student: {
          include: {
            Classroom: true,
          },
        },
      },
      orderBy: {createdAt: 'asc'},
    })

    return responses
  },

  async getGameResponses(gameId) {
    const responses = await prisma.slideResponse.findMany({
      where: {gameId: parseInt(gameId)},
      include: {
        Student: {
          include: {
            Classroom: true,
          },
        },
        Slide: true,
      },
      orderBy: [{slideId: 'asc'}, {createdAt: 'asc'}],
    })

    return responses
  },

  async checkQuizAnswer(slideId, choiceAnswer) {
    // Get the correct answer for this slide
    const correctChoice = await prisma.slideBlock.findFirst({
      where: {
        slideId: parseInt(slideId),
        blockType: 'choice_option',
        isCorrectAnswer: true,
      },
    })

    return {
      isCorrect: correctChoice ? correctChoice.id.toString() === choiceAnswer : false,
      correctAnswer: correctChoice,
    }
  },

  async deleteResponse(responseId) {
    await prisma.slideResponse.delete({
      where: {id: parseInt(responseId)},
    })

    revalidatePath('/edu/colabo/presentation')
  },

  async exportResponses(gameId, format = 'csv') {
    const responses = await this.getGameResponses(gameId)

    if (format === 'csv') {
      // Generate CSV data
      const headers = [
        'Student Name',
        'Slide Title',
        'Response Type',
        'Choice Answer',
        'Text Answer',
        'Curiosity 1',
        'Curiosity 2',
        'Curiosity 3',
        'Curiosity 4',
        'Curiosity 5',
        'Efficacy 1',
        'Efficacy 2',
        'Efficacy 3',
        'Efficacy 4',
        'Efficacy 5',
        'Submitted At',
      ]

      const rows = responses.map(response => [
        response.Student?.name || '',
        response.Slide?.title || '',
        response.responseType || '',
        response.choiceAnswer || '',
        response.textAnswer || '',
        response.curiocity1 || '',
        response.curiocity2 || '',
        response.curiocity3 || '',
        response.curiocity4 || '',
        response.curiocity5 || '',
        response.efficacy1 || '',
        response.efficacy2 || '',
        response.efficacy3 || '',
        response.efficacy4 || '',
        response.efficacy5 || '',
        response.createdAt.toISOString(),
      ])

      return {
        headers,
        rows,
        filename: `colabo_responses_${gameId}_${new Date().toISOString().split('T')[0]}.csv`,
      }
    }

    return responses
  },
}
