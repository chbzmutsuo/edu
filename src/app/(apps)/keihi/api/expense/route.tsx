import {NextRequest, NextResponse} from 'next/server'
import {createExpense, createExpenseWithDraft} from '@app/(apps)/keihi/api/expense/createExpense'
import {ExpenseFormData} from '@app/(apps)/keihi/types'

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const {
      formData,
      draft,
      imageFiles,
      useDraft = false,
    }: {
      formData: ExpenseFormData
      draft?: {
        businessInsightDetail: string
        businessInsightSummary: string
        techInsightDetail: string
        techInsightSummary: string
        autoTags: string[]
        generatedKeywords?: string[]
      }
      imageFiles?: File[]
      useDraft?: boolean
    } = body

    if (!formData) {
      return NextResponse.json({success: false, error: 'フォームデータが提供されていません'}, {status: 400})
    }

    let result

    if (useDraft && draft) {
      // 下書きを使用した経費記録作成
      result = await createExpenseWithDraft(formData, draft, imageFiles)
    } else {
      // 通常の経費記録作成
      result = await createExpense(formData, imageFiles)
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      })
    } else {
      return NextResponse.json({success: false, error: result.error}, {status: 500})
    }
  } catch (error) {
    console.error('経費記録作成APIエラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '経費記録の作成に失敗しました',
      },
      {status: 500}
    )
  }
}
