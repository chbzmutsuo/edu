'use server'

import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {HOUR_SLOTS} from '../(constants)/types'

// 日誌を取得または作成
export async function getOrCreateJournal(userId: number, date: string) {
  try {
    // 日本時刻の00:00として設定（UTC-9時間）
    const journalDate = new Date(date + 'T00:00:00+09:00')

    // 既存の日誌を検索
    const findResult = await doStandardPrisma('healthJournal', 'findUnique', {
      where: {
        userId_journalDate: {
          userId,
          journalDate,
        },
      },
      include: {
        entries: {
          include: {
            images: true,
          },
          orderBy: {
            hourSlot: 'asc',
          },
        },
      },
    })

    if (findResult.success && findResult.result) {
      return {
        success: true,
        data: formatJournalData(findResult.result),
      }
    }

    // 新規作成
    const createResult = await doStandardPrisma('healthJournal', 'create', {
      data: {
        userId,
        journalDate,
        templateApplied: false,
      },
      include: {
        entries: {
          include: {
            images: true,
          },
          orderBy: {
            hourSlot: 'asc',
          },
        },
      },
    })

    if (!createResult.success) {
      return {
        success: false,
        error: '日誌の作成に失敗しました',
      }
    }

    return {
      success: true,
      data: formatJournalData(createResult.result),
    }
  } catch (error) {
    console.error('日誌取得エラー:', error)
    return {
      success: false,
      error: '日誌の取得に失敗しました',
    }
  }
}

// テンプレートを適用
export async function applyJournalTemplate(journalId: number) {
  try {
    const entries = HOUR_SLOTS.map(hourSlot => ({
      journalId,
      hourSlot,
    }))

    const createResult = await doStandardPrisma('healthJournalEntry', 'createMany', {
      data: entries,
      skipDuplicates: true,
    })

    if (!createResult.success) {
      return {
        success: false,
        error: 'エントリの作成に失敗しました',
      }
    }

    const updateResult = await doStandardPrisma('healthJournal', 'update', {
      where: {id: journalId},
      data: {templateApplied: true},
    })

    if (!updateResult.success) {
      return {
        success: false,
        error: 'テンプレート適用フラグの更新に失敗しました',
      }
    }

    return {success: true}
  } catch (error) {
    console.error('テンプレート適用エラー:', error)
    return {
      success: false,
      error: 'テンプレートの適用に失敗しました',
    }
  }
}

// 日誌を更新
export async function updateJournal(journalId: number, goalAndReflection: string) {
  try {
    const result = await doStandardPrisma('healthJournal', 'update', {
      where: {id: journalId},
      data: {goalAndReflection},
      include: {
        entries: {
          include: {
            images: true,
          },
          orderBy: {
            hourSlot: 'asc',
          },
        },
      },
    })

    if (!result.success) {
      return {
        success: false,
        error: '日誌の更新に失敗しました',
      }
    }

    return {
      success: true,
      data: formatJournalData(result.result),
    }
  } catch (error) {
    console.error('日誌更新エラー:', error)
    return {
      success: false,
      error: '日誌の更新に失敗しました',
    }
  }
}

// エントリを更新
export async function updateJournalEntry(entryId: number, comment: string) {
  try {
    const result = await doStandardPrisma('healthJournalEntry', 'update', {
      where: {id: entryId},
      data: {comment},
      include: {
        images: true,
      },
    })

    if (!result.success) {
      return {
        success: false,
        error: 'エントリの更新に失敗しました',
      }
    }

    return {
      success: true,
      data: formatEntryData(result.result),
    }
  } catch (error) {
    console.error('エントリ更新エラー:', error)
    return {
      success: false,
      error: 'エントリの更新に失敗しました',
    }
  }
}

// 指定日の全健康記録を取得
export async function getAllHealthRecordsForDate(userId: number, journalDate: string) {
  try {
    // 日本時刻の7:00から翌日7:00までの範囲（日誌の基点に合わせる）
    const baseDate = new Date(journalDate + 'T00:00:00+09:00')
    const startDate = new Date(baseDate)
    startDate.setHours(7, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)

    const result = await doStandardPrisma('healthRecord', 'findMany', {
      where: {
        userId,
        recordDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        Medicine: true,
      },
      orderBy: {
        recordTime: 'asc',
      },
    })

    return {
      success: true,
      data: result.success ? result.result : [],
    }
  } catch (error) {
    console.error('健康記録取得エラー:', error)
    return {
      success: false,
      error: '健康記録の取得に失敗しました',
      data: [],
    }
  }
}

// 指定時間帯の健康記録を取得（廃止予定 - 互換性のため残す）
export async function getHealthRecordsForTimeSlot(userId: number, journalDate: string, hourSlot: number) {
  try {
    // 日本時刻の00:00として設定（UTC-9時間）
    const startDate = new Date(journalDate + 'T00:00:00+09:00')
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)

    // 時間帯の開始・終了時刻を計算
    const startHour = hourSlot
    const endHour = hourSlot === 6 ? 7 : (hourSlot + 1) % 24

    const startTime = `${startHour.toString().padStart(2, '0')}:00`
    const endTime = `${endHour.toString().padStart(2, '0')}:00`

    const result = await doStandardPrisma('healthRecord', 'findMany', {
      where: {
        userId,
        recordDate: {
          gte: startDate,
          lt: endDate,
        },
        recordTime: {
          gte: startTime,
          lt: endTime,
        },
      },
      include: {
        Medicine: true,
      },
      orderBy: {
        recordTime: 'asc',
      },
    })

    return {
      success: true,
      data: result.success ? result.result : [],
    }
  } catch (error) {
    console.error('健康記録取得エラー:', error)
    return {
      success: false,
      error: '健康記録の取得に失敗しました',
      data: [],
    }
  }
}

// 画像を追加
export async function addJournalImage(
  entryId: number,
  imageData: {
    fileName: string
    filePath: string
    fileSize?: number
    mimeType?: string
    description?: string
  }
) {
  try {
    const result = await doStandardPrisma('healthJournalImage', 'create', {
      data: {
        entryId,
        ...imageData,
      },
    })

    return {
      success: result.success,
      data: result.success ? result.result : null,
      error: result.success ? null : '画像の追加に失敗しました',
    }
  } catch (error) {
    console.error('画像追加エラー:', error)
    return {
      success: false,
      error: '画像の追加に失敗しました',
    }
  }
}

// 画像を削除
export async function deleteJournalImage(imageId: number) {
  try {
    const result = await doStandardPrisma('healthJournalImage', 'delete', {
      where: {id: imageId},
    })

    return {
      success: result.success,
      error: result.success ? null : '画像の削除に失敗しました',
    }
  } catch (error) {
    console.error('画像削除エラー:', error)
    return {
      success: false,
      error: '画像の削除に失敗しました',
    }
  }
}

// データフォーマット関数
function formatJournalData(journal: any) {
  return {
    id: journal.id,
    userId: journal.userId,
    journalDate: journal.journalDate.toISOString().split('T')[0],
    goalAndReflection: journal.goalAndReflection || '',
    templateApplied: journal.templateApplied,
    entries: journal.entries.map(formatEntryData),
    createdAt: journal.createdAt.toISOString(),
    updatedAt: journal.updatedAt?.toISOString(),
  }
}

function formatEntryData(entry: any) {
  return {
    id: entry.id,
    journalId: entry.journalId,
    hourSlot: entry.hourSlot,
    comment: entry.comment || '',
    images:
      entry.images?.map((image: any) => ({
        id: image.id,
        entryId: image.entryId,
        fileName: image.fileName,
        filePath: image.filePath,
        fileSize: image.fileSize,
        mimeType: image.mimeType,
        description: image.description,
        createdAt: image.createdAt.toISOString(),
        updatedAt: image.updatedAt?.toISOString(),
      })) || [],
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt?.toISOString(),
  }
}
