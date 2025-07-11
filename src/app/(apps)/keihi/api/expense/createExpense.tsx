import {FileHandler} from 'src/cm/class/FileHandler'

import prisma from 'src/lib/prisma'
import {MAJOR_ACCOUNTS} from '@app/(apps)/keihi/actions/expense/constants'
import {ExpenseFormData} from '@app/(apps)/keihi/types'
import {generateInsights} from '@app/(apps)/keihi/actions/expense/insights'

// 下書きを使用した経費記録作成
export const createExpenseWithDraft = async (
  formData: ExpenseFormData,
  draft: {
    businessInsightDetail: string
    businessInsightSummary: string
    techInsightDetail: string
    techInsightSummary: string
    autoTags: string[]
    generatedKeywords?: string[]
  },
  imageFiles?: File[]
): Promise<{
  success: boolean
  data?: {id: string}
  error?: string
}> => {
  try {
    // MF用の情報を生成
    const mfSubject = MAJOR_ACCOUNTS.find(acc => acc.account === formData.subject)?.account || formData.subject
    const mfTaxCategory = MAJOR_ACCOUNTS.find(acc => acc.account === formData.subject)?.taxCategory || '課仕 10%'
    const mfMemo = formData.conversationSummary || `${formData.subject} ${formData.amount}円`

    const expense = await prisma.keihiExpense.create({
      data: {
        date: new Date(formData.date),
        amount: formData.amount,
        subject: formData.subject,
        location: formData.location,
        counterpartyName: formData.counterpartyName,
        counterpartyIndustry: formData.counterpartyIndustry,
        conversationPurpose: formData.conversationPurpose,
        keywords: formData.keywords || [],
        conversationSummary: formData.conversationSummary,
        learningDepth: formData.learningDepth,
        // 税務調査対応項目
        counterpartyContact: formData.counterpartyContact,
        followUpPlan: formData.followUpPlan,
        businessOpportunity: formData.businessOpportunity,
        competitorInfo: formData.competitorInfo,
        businessInsightDetail: draft.businessInsightDetail,
        businessInsightSummary: draft.businessInsightSummary,
        techInsightDetail: draft.techInsightDetail,
        techInsightSummary: draft.techInsightSummary,
        autoTags: draft.autoTags,
        mfSubject,
        mfTaxCategory,
        mfMemo,
      },
    })

    // 画像ファイルがある場合はS3にアップロードして添付ファイルを作成
    if (imageFiles && imageFiles.length > 0) {
      try {
        for (const file of imageFiles) {
          // ファイル検証
          const validation = FileHandler.validateFile(file)

          if (!validation.isValid) {
            console.warn(`ファイル検証失敗: ${file.name} - ${validation.errors.join(', ')}`)
            continue
          }

          // S3にアップロード
          const s3Result = await FileHandler.sendFileToS3({
            file,
            formDataObj: {bucketKey: 'keihi'},
          })

          if (!s3Result.success) {
            console.warn(`S3アップロード失敗: ${file.name} - ${s3Result.error}`)
            continue
          }

          // 添付ファイルレコードを作成
          await prisma.keihiAttachment.create({
            data: {
              filename: `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`,
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              url: s3Result.result?.url || '',
              keihiExpenseId: expense.id,
            },
          })
        }
      } catch (error) {
        console.error('画像アップロードエラー:', error)
        // 画像アップロードに失敗してもレコード作成は成功とする
      }
    }

    return {success: true, data: {id: expense.id}}
  } catch (error) {
    console.error('経費記録作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '作成に失敗しました',
    }
  }
}

// 経費記録作成
export const createExpense = async (
  formData: ExpenseFormData,
  imageFiles?: File[]
): Promise<{
  success: boolean
  data?: {id: string}
  error?: string
}> => {
  try {
    // AIインサイト生成
    const insights = await generateInsights(formData)

    const expense = await prisma.keihiExpense.create({
      data: {
        date: new Date(formData.date),
        amount: formData.amount,
        subject: formData.subject,
        location: formData.location,
        counterpartyName: formData.counterpartyName,
        counterpartyIndustry: formData.counterpartyIndustry,
        conversationPurpose: formData.conversationPurpose,
        keywords: formData.keywords || [],
        conversationSummary: formData.conversationSummary,
        learningDepth: formData.learningDepth,
        // 税務調査対応項目
        counterpartyContact: formData.counterpartyContact,
        followUpPlan: formData.followUpPlan,
        businessOpportunity: formData.businessOpportunity,
        competitorInfo: formData.competitorInfo,
        businessInsightDetail: insights.businessInsightDetail,
        businessInsightSummary: insights.businessInsightSummary,
        techInsightDetail: insights.techInsightDetail,
        techInsightSummary: insights.techInsightSummary,
        autoTags: insights.autoTags,
        mfSubject: insights.mfSubject,
        mfTaxCategory: insights.mfTaxCategory,
        mfMemo: insights.mfMemo,
      },
    })

    // 画像ファイルがある場合はS3にアップロードして添付ファイルを作成
    if (imageFiles && imageFiles.length > 0) {
      try {
        for (const file of imageFiles) {
          // ファイル検証
          const validation = FileHandler.validateFile(file)

          if (!validation.isValid) {
            console.warn(`ファイル検証失敗: ${file.name} - ${validation.errors.join(', ')}`)
            continue
          }

          // S3にアップロード
          const s3Result = await FileHandler.sendFileToS3({
            file,
            formDataObj: {
              bucketKey: 'keihi',
            },
          })

          if (!s3Result.success) {
            console.warn(`S3アップロード失敗: ${file.name} - ${s3Result.error}`)
            continue
          }

          // 添付ファイルレコードを作成
          await prisma.keihiAttachment.create({
            data: {
              filename: `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`,
              originalName: file.name,
              mimeType: file.type,
              size: file.size,
              url: s3Result.result?.url || '',
              keihiExpenseId: expense.id,
            },
          })
        }
      } catch (error) {
        console.error('画像アップロードエラー:', error)
        // 画像アップロードに失敗してもレコード作成は成功とする
      }
    }

    return {success: true, data: {id: expense.id}}
  } catch (error) {
    console.error('経費記録作成エラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '作成に失敗しました',
    }
  }
}

// クライアント側API呼び出し関数
export const fetchCreateExpenseApi = async (
  formData: ExpenseFormData,
  imageFiles?: File[],
  useDraft?: boolean,
  draft?: {
    businessInsightDetail: string
    businessInsightSummary: string
    techInsightDetail: string
    techInsightSummary: string
    autoTags: string[]
    generatedKeywords?: string[]
  }
): Promise<{
  success: boolean
  data?: {id: string}
  error?: string
}> => {
  try {
    const requestFormData = new FormData()

    // フォームデータをJSONとして追加
    requestFormData.append('formData', JSON.stringify(formData))

    // 下書きデータがある場合は追加
    if (draft) {
      requestFormData.append('draft', JSON.stringify(draft))
    }

    // useDraftフラグを追加
    requestFormData.append('useDraft', JSON.stringify(useDraft || false))

    // 画像ファイルがある場合は追加
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file, index) => {
        requestFormData.append(`imageFile_${index}`, file)
      })
      requestFormData.append('imageFileCount', imageFiles.length.toString())
    }

    const response = await fetch('/keihi/api/expense', {
      method: 'POST',
      body: requestFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.error || 'サーバーエラーが発生しました',
      }
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('API呼び出しエラー:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'API呼び出しに失敗しました',
    }
  }
}
