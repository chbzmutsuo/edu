import {NextRequest, NextResponse} from 'next/server'
import {createExpense, createExpenseWithDraft} from '@app/(apps)/keihi/api/expense/createExpense'
import {ExpenseFormData} from '@app/(apps)/keihi/types'

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData()

    // フォームデータを取得
    const formDataJson = formData.get('formData') as string
    const draftJson = formData.get('draft') as string
    const useDraftJson = formData.get('useDraft') as string
    const imageFileCount = formData.get('imageFileCount') as string

    if (!formDataJson) {
      return NextResponse.json({success: false, error: 'フォームデータが提供されていません'}, {status: 400})
    }

    const expenseFormData: ExpenseFormData = JSON.parse(formDataJson)
    const draft = draftJson ? JSON.parse(draftJson) : undefined
    const useDraft = useDraftJson ? JSON.parse(useDraftJson) : false

    // 画像ファイルを取得
    const imageFiles: File[] = []
    if (imageFileCount) {
      const count = parseInt(imageFileCount)
      for (let i = 0; i < count; i++) {
        const file = formData.get(`imageFile_${i}`) as File
        if (file) {
          imageFiles.push(file)
        }
      }
    }

    let result

    if (useDraft && draft) {
      // 下書きを使用した経費記録作成
      result = await createExpenseWithDraft(expenseFormData, draft, imageFiles)
    } else {
      // 通常の経費記録作成
      result = await createExpense(expenseFormData, imageFiles)
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
