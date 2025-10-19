'use server'

import prisma from 'src/lib/prisma'
import {Prisma} from '@prisma/client'
import {v4 as uuidv4} from 'uuid'

/**
 * Game作成
 */
export async function createColaboGame(data: {
  name: string
  date: Date
  schoolId: number
  teacherId: number
  subjectNameMasterId?: number
  studentIds?: number[]
}) {
  try {
    const {name, date, schoolId, teacherId, subjectNameMasterId, studentIds = []} = data

    // 秘密鍵を生成
    const secretKey = uuidv4().substring(0, 8)

    // Gameを作成
    const game = await prisma.game.create({
      data: {
        name,
        date,
        schoolId,
        teacherId,
        subjectNameMasterId,
        secretKey,
        absentStudentIds: [],
        randomTargetStudentIds: [],
        status: 'preparing', // 準備中
        currentSlideId: null,
        slideMode: null,
      },
      include: {
        School: true,
        Teacher: true,
        SubjectNameMaster: true,
      },
    })

    // GameStudentを作成（生徒がいる場合）
    if (studentIds.length > 0) {
      await prisma.gameStudent.createMany({
        data: studentIds.map((studentId, index) => ({
          gameId: game.id,
          studentId,
          sortOrder: index,
        })),
      })
    }

    return {
      success: true,
      game,
    }
  } catch (error) {
    console.error('[createColaboGame] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Game作成に失敗しました',
    }
  }
}

/**
 * Gameに生徒を追加
 */
export async function addStudentsToGame(gameId: number, studentIds: number[]) {
  try {
    // 既存の生徒を取得
    const existingStudents = await prisma.gameStudent.findMany({
      where: {gameId},
      select: {studentId: true},
    })

    const existingStudentIds = new Set(existingStudents.map(gs => gs.studentId))

    // 新しい生徒のみを追加
    const newStudentIds = studentIds.filter(id => !existingStudentIds.has(id))

    if (newStudentIds.length > 0) {
      const maxSortOrder = await prisma.gameStudent
        .findMany({
          where: {gameId},
          orderBy: {sortOrder: 'desc'},
          take: 1,
        })
        .then(result => (result.length > 0 ? result[0].sortOrder : 0))

      await prisma.gameStudent.createMany({
        data: newStudentIds.map((studentId, index) => ({
          gameId,
          studentId,
          sortOrder: maxSortOrder + index + 1,
        })),
      })
    }

    return {
      success: true,
      addedCount: newStudentIds.length,
    }
  } catch (error) {
    console.error('[addStudentsToGame] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生徒の追加に失敗しました',
    }
  }
}

/**
 * スライド作成
 */
export async function createSlide(data: {gameId: number; templateType: string; contentData: any; sortOrder?: number}) {
  try {
    const {gameId, templateType, contentData, sortOrder} = data

    // sortOrderが指定されていない場合は最後に追加
    let finalSortOrder = sortOrder
    if (finalSortOrder === undefined) {
      const lastSlide = await prisma.slide.findFirst({
        where: {gameId},
        orderBy: {sortOrder: 'desc'},
      })
      finalSortOrder = lastSlide ? lastSlide.sortOrder + 1 : 0
    }

    const slide = await prisma.slide.create({
      data: {
        gameId,
        templateType,
        contentData: contentData as Prisma.InputJsonValue,
        sortOrder: finalSortOrder,
      },
    })

    return {
      success: true,
      slide,
    }
  } catch (error) {
    console.error('[createSlide] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'スライド作成に失敗しました',
    }
  }
}

/**
 * スライド更新
 */
export async function updateSlide(slideId: number, data: {templateType?: string; contentData?: any; sortOrder?: number}) {
  try {
    const updateData: any = {}

    if (data.templateType !== undefined) {
      updateData.templateType = data.templateType
    }
    if (data.contentData !== undefined) {
      updateData.contentData = data.contentData as Prisma.InputJsonValue
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder
    }

    const slide = await prisma.slide.update({
      where: {id: slideId},
      data: updateData,
    })

    return {
      success: true,
      slide,
    }
  } catch (error) {
    console.error('[updateSlide] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'スライド更新に失敗しました',
    }
  }
}

/**
 * スライド削除
 */
export async function deleteSlide(slideId: number) {
  try {
    await prisma.slide.update({
      where: {id: slideId},
      data: {active: false},
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('[deleteSlide] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'スライド削除に失敗しました',
    }
  }
}

/**
 * スライド順序を更新
 */
export async function updateSlideOrder(slideIds: number[]) {
  try {
    // トランザクションで順序を更新
    await prisma.$transaction(
      slideIds.map((slideId, index) =>
        prisma.slide.update({
          where: {id: slideId},
          data: {sortOrder: index},
        })
      )
    )

    return {
      success: true,
    }
  } catch (error) {
    console.error('[updateSlideOrder] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'スライド順序の更新に失敗しました',
    }
  }
}

/**
 * Game状態を更新
 */
export async function updateGameState(
  gameId: number,
  data: {
    currentSlideId?: number | null
    slideMode?: string | null
    status?: string
  }
) {
  try {
    const game = await prisma.game.update({
      where: {id: gameId},
      data,
    })

    return {
      success: true,
      game,
    }
  } catch (error) {
    console.error('[updateGameState] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Game状態の更新に失敗しました',
    }
  }
}

/**
 * 生徒回答を保存
 */
export async function saveSlideAnswer(data: {gameId: number; slideId: number; studentId: number; answerData: any}) {
  try {
    const {gameId, slideId, studentId, answerData} = data

    const answer = await prisma.slideAnswer.upsert({
      where: {
        slideId_studentId_gameId: {
          slideId,
          studentId,
          gameId,
        },
      },
      create: {
        gameId,
        slideId,
        studentId,
        answerData: answerData as Prisma.InputJsonValue,
      },
      update: {
        answerData: answerData as Prisma.InputJsonValue,
      },
    })

    return {
      success: true,
      answer,
    }
  } catch (error) {
    console.error('[saveSlideAnswer] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '回答の保存に失敗しました',
    }
  }
}

/**
 * スライドの回答一覧を取得
 */
export async function getSlideAnswers(slideId: number) {
  try {
    const answers = await prisma.slideAnswer.findMany({
      where: {
        slideId,
        active: true,
      },
      include: {
        Student: {
          select: {
            id: true,
            name: true,
            attendanceNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return {
      success: true,
      answers,
    }
  } catch (error) {
    console.error('[getSlideAnswers] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '回答の取得に失敗しました',
    }
  }
}

/**
 * Gameのスライド一覧を取得
 */
export async function getGameSlides(gameId: number) {
  try {
    const slides = await prisma.slide.findMany({
      where: {
        gameId,
        active: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return {
      success: true,
      slides,
    }
  } catch (error) {
    console.error('[getGameSlides] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'スライドの取得に失敗しました',
    }
  }
}

/**
 * Gameの詳細情報を取得
 */
export async function getColaboGame(gameId: number) {
  try {
    const game = await prisma.game.findUnique({
      where: {id: gameId},
      include: {
        School: true,
        Teacher: true,
        SubjectNameMaster: true,
        GameStudent: {
          include: {
            Student: {
              select: {
                id: true,
                name: true,
                kana: true,
                attendanceNumber: true,
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        Slide: {
          where: {active: true},
          orderBy: {sortOrder: 'asc'},
        },
      },
    })

    if (!game) {
      return {
        success: false,
        error: 'Gameが見つかりません',
      }
    }

    return {
      success: true,
      game,
    }
  } catch (error) {
    console.error('[getColaboGame] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gameの取得に失敗しました',
    }
  }
}

/**
 * 秘密鍵からGameを検索
 */
export async function findGameBySecretKey(secretKey: string) {
  try {
    const game = await prisma.game.findUnique({
      where: {secretKey},
      include: {
        School: true,
        Teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        GameStudent: {
          include: {
            Student: {
              select: {
                id: true,
                name: true,
                kana: true,
                attendanceNumber: true,
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    if (!game) {
      return {
        success: false,
        error: '指定された秘密鍵のGameが見つかりません',
      }
    }

    return {
      success: true,
      game,
    }
  } catch (error) {
    console.error('[findGameBySecretKey] エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gameの検索に失敗しました',
    }
  }
}
