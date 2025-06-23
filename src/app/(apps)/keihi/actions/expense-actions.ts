'use server'

import {revalidatePath} from 'next/cache'
import OpenAI from 'openai'
import {FileHandler} from 'src/cm/class/FileHandler'
import {S3_API_FormData} from '@pages/api/S3'
import prisma from '@lib/prisma'

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

export interface AIAnalysisResult {
  businessInsightDetail: string
  businessInsightSummary: string
  techInsightDetail: string
  techInsightSummary: string
  autoTags: string[]
  mfSubject: string
  mfTaxCategory: string
  mfMemo: string
}

// インサイト生成の設定オプション
interface InsightGenerationOptions {
  isDraft?: boolean // 下書きモードかどうか
  additionalInstruction?: string // 追加指示
  includeMoneyForwardData?: boolean // MoneyForward用データを含めるか
}

// インサイト生成結果の型
interface InsightGenerationResult {
  businessInsightDetail: string
  businessInsightSummary: string
  techInsightDetail: string
  techInsightSummary: string
  autoTags: string[]
  generatedKeywords?: string[] // 下書きモードの場合のみ
  mfSubject?: string // MoneyForward用データ
  mfTaxCategory?: string
  mfMemo?: string
}

// 経費記録一覧取得
export const getExpenses = async (page = 1, limit = 20) => {
  try {
    const expenses = await prisma.keihiExpense.findMany({
      include: {
        KeihiAttachment: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.keihiExpense.count()

    return {
      success: true,
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('経費記録取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得に失敗しました',
    }
  }
}

// 経費記録詳細取得
export const getExpenseById = async (id: string) => {
  try {
    const expense = await prisma.keihiExpense.findUnique({
      where: {id},
      include: {
        KeihiAttachment: true,
      },
    })

    if (!expense) {
      return {success: false, error: '記録が見つかりません'}
    }

    return {success: true, data: expense}
  } catch (error) {
    console.error('経費記録詳細取得エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '取得に失敗しました',
    }
  }
}

// 経費記録更新
export const updateExpense = async (
  id: string,
  data: {
    date?: Date
    amount?: number
    subject?: string
    location?: string
    counterpartyName?: string
    counterpartyIndustry?: string
    conversationPurpose?: string
    keywords?: string[]
    conversationSummary?: string
    learningDepth?: number
    // インサイト関連
    businessInsightDetail?: string
    businessInsightSummary?: string
    techInsightDetail?: string
    techInsightSummary?: string
    autoTags?: string[]
    // 税務調査対応項目
    counterpartyContact?: string
    followUpPlan?: string
    businessOpportunity?: string
    competitorInfo?: string
    mfSubject?: string
    mfTaxCategory?: string
    mfMemo?: string
  }
) => {
  try {
    const expense = await prisma.keihiExpense.update({
      where: {id},
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        KeihiAttachment: true,
      },
    })

    revalidatePath('/keihi')
    revalidatePath(`/keihi/expense/${id}`)
    return {success: true, data: expense}
  } catch (error) {
    console.error('記録更新エラー:', error)
    return {success: false, error: '記録の更新に失敗しました'}
  }
}

// 経費記録削除
export const deleteExpense = async (
  id: string
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    // 関連する添付ファイルも削除
    await prisma.keihiAttachment.deleteMany({
      where: {keihiExpenseId: id},
    })

    // 経費記録を削除
    await prisma.keihiExpense.delete({
      where: {id},
    })

    revalidatePath('/keihi')
    return {success: true}
  } catch (error) {
    console.error('経費記録削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '削除に失敗しました',
    }
  }
}

// 複数の経費記録を一括削除
export const deleteMultipleExpenses = async (
  ids: string[]
): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> => {
  try {
    // 関連する添付ファイルも削除
    await prisma.keihiAttachment.deleteMany({
      where: {keihiExpenseId: {in: ids}},
    })

    // 経費記録を一括削除
    const result = await prisma.keihiExpense.deleteMany({
      where: {id: {in: ids}},
    })

    revalidatePath('/keihi')
    return {
      success: true,
      deletedCount: result.count,
    }
  } catch (error) {
    console.error('経費記録一括削除エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '一括削除に失敗しました',
    }
  }
}

// ファイルアップロード（S3使用）
export const uploadAttachment = async (
  formData: FormData
): Promise<{
  success: boolean
  data?: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
  }
  error?: string
}> => {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return {success: false, error: 'ファイルが選択されていません'}
    }

    // FileHandlerを使用してファイル検証
    const validation = FileHandler.validateFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      }
    }

    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || ''
    const filename = `keihi/${timestamp}_${randomString}.${extension}`

    // S3アップロード用のフォームデータ
    const s3FormData: S3_API_FormData = {
      backetKey: 'keihi', // フォルダ名
    }

    // S3にアップロード
    const uploadResult = await FileHandler.sendFileToS3({
      file,
      formDataObj: s3FormData,
      validateFile: false, // 既に検証済み
    })

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error || 'S3アップロードに失敗しました',
      }
    }

    // S3のURLを取得（アップロード結果から）
    const s3Url = uploadResult.result?.url || `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/keihi/${filename}`

    // データベースに保存（expenseIdは後で関連付け）
    const attachment = await prisma.keihiAttachment.create({
      data: {
        filename: filename.split('/').pop() || filename, // ファイル名のみ
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: s3Url,
        // keihiExpenseIdは省略（nullableなので後で関連付け）
      },
    })

    return {
      success: true,
      data: {
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        size: attachment.size,
        url: attachment.url,
      },
    }
  } catch (error) {
    console.error('ファイルアップロードエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました',
    }
  }
}

// 添付ファイルを経費記録に関連付け
export const linkAttachmentsToExpense = async (
  expenseId: string,
  attachmentIds: string[]
): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    await prisma.keihiAttachment.updateMany({
      where: {
        id: {in: attachmentIds},
        keihiExpenseId: null, // 未関連付けのもののみ
      },
      data: {
        keihiExpenseId: expenseId,
      },
    })

    return {success: true}
  } catch (error) {
    console.error('添付ファイル関連付けエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '添付ファイルの関連付けに失敗しました',
    }
  }
}

// // 未関連付けの添付ファイルを削除（クリーンアップ用）
// export const cleanupUnlinkedAttachments = async (): Promise<{
//   success: boolean
//   deletedCount?: number
//   error?: string
// }> => {
//   try {
//     // 1時間以上前に作成された未関連付けファイルを削除
//     const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

//     const unlinkedAttachments = await prisma.keihiAttachment.findMany({
//       where: {
//         keihiExpenseId: null,
//         createdAt: {lt: oneHourAgo},
//       },
//     })

//     // S3からファイルを削除
//     for (const attachment of unlinkedAttachments) {
//       try {
//         // S3のURLからファイルキーを抽出
//         const s3FormData: S3_API_FormData = {
//           backetKey: 'keihi',
//           deleteImageUrl: attachment.url,
//         }

//         // FileHandlerを使用してS3から削除
//         await FileHandler.sendFileToS3({
//           file: null, // 削除の場合はnull
//           formDataObj: s3FormData,
//           validateFile: false,
//         })
//       } catch (error) {
//         console.warn('S3ファイル削除エラー:', attachment.filename, error)
//       }
//     }

//     // データベースから削除
//     const result = await prisma.keihiAttachment.deleteMany({
//       where: {
//         keihiExpenseId: null,
//         createdAt: {lt: oneHourAgo},
//       },
//     })

//     return {
//       success: true,
//       deletedCount: result.count,
//     }
//   } catch (error) {
//     console.error('未関連付けファイル削除エラー:', error)
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'クリーンアップに失敗しました',
//     }
//   }
// }

// // 添付ファイル削除
// export const deleteAttachment = async (
//   attachmentId: string
// ): Promise<{
//   success: boolean
//   error?: string
// }> => {
//   try {
//     const attachment = await prisma.keihiAttachment.findUnique({
//       where: {id: attachmentId},
//     })

//     if (!attachment) {
//       return {success: false, error: '添付ファイルが見つかりません'}
//     }

//     // S3からファイルを削除
//     try {
//       const s3FormData: S3_API_FormData = {
//         backetKey: 'keihi',
//         deleteImageUrl: attachment.url,
//       }

//       // FileHandlerを使用してS3から削除
//       await FileHandler.sendFileToS3({
//         file: null, // 削除の場合はnull
//         formDataObj: s3FormData,
//         validateFile: false,
//       })
//     } catch (error) {
//       console.warn('S3ファイル削除エラー:', attachment.filename, error)
//     }

//     // データベースから削除
//     await prisma.keihiAttachment.delete({
//       where: {id: attachmentId},
//     })

//     return {success: true}
//   } catch (error) {
//     console.error('添付ファイル削除エラー:', error)
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : '添付ファイルの削除に失敗しました',
//     }
//   }
// }

// 手動でrevalidateを実行するためのServer Action
export const revalidateKeihiPages = async (): Promise<{
  success: boolean
  error?: string
}> => {
  try {
    revalidatePath('/keihi')
    revalidatePath('/keihi', 'layout')
    return {success: true}
  } catch (error) {
    console.error('revalidateエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'revalidateに失敗しました',
    }
  }
}

// 複数の経費記録を削除（エイリアス）
export const deleteExpenses = async (
  ids: string[]
): Promise<{
  success: boolean
  deletedCount?: number
  error?: string
}> => {
  return deleteMultipleExpenses(ids)
}

// CSV出力
export const exportExpensesToCsv = async (
  selectedIds?: string[]
): Promise<{
  success: boolean
  data?: string
  error?: string
}> => {
  try {
    let expenses

    if (selectedIds && selectedIds.length > 0) {
      // 選択された記録のみ
      expenses = await prisma.keihiExpense.findMany({
        where: {
          id: {
            in: selectedIds,
          },
        },
        include: {
          KeihiAttachment: true,
        },
        orderBy: {
          date: 'desc',
        },
      })
    } else {
      // 全件
      expenses = await prisma.keihiExpense.findMany({
        include: {
          KeihiAttachment: true,
        },
        orderBy: {
          date: 'desc',
        },
      })
    }

    // CSVヘッダー
    const headers = [
      '取引日',
      '勘定科目',
      '税区分',
      '金額',
      '摘要',
      '補助科目',
      '部門',
      '取引先',
      '品目',
      'メモタグ',
      'MF連携用科目',
      'MF連携用摘要',
      '相手名',
      '場所',
      '目的',
      'キーワード',
      '営業インサイト',
      '技術インサイト',
      'AIタグ',
      '添付ファイル数',
    ]

    // CSVデータ
    const csvRows = expenses.map(expense => [
      expense.date.toISOString().split('T')[0], // 取引日
      expense.mfSubject || expense.subject, // 勘定科目
      expense.mfTaxCategory || '課仕 10%', // 税区分
      expense.amount, // 金額
      expense.mfMemo || expense.subject, // 摘要
      '', // 補助科目
      expense.mfDepartment || '', // 部門
      expense.counterpartyName || '', // 取引先
      '', // 品目
      '', // メモタグ
      expense.mfSubject || '', // MF連携用科目
      expense.mfMemo || '', // MF連携用摘要
      expense.counterpartyName || '', // 相手名
      expense.location || '', // 場所
      expense.conversationPurpose || '', // 目的
      expense.keywords.join(', '), // キーワード
      expense.businessInsightSummary || '', // 営業インサイト
      expense.techInsightSummary || '', // 技術インサイト
      expense.autoTags.join(', '), // AIタグ
      expense.KeihiAttachment.length, // 添付ファイル数
    ])

    // CSV文字列を生成
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row =>
        row.map(field => (typeof field === 'string' && field.includes(',') ? `"${field.replace(/"/g, '""')}"` : field)).join(',')
      ),
    ].join('\n')

    // BOMを追加してExcelで正しく表示されるようにする
    const csvWithBom = '\uFEFF' + csvContent

    return {
      success: true,
      data: csvWithBom,
    }
  } catch (error) {
    console.error('CSV出力エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CSV出力に失敗しました',
    }
  }
}
