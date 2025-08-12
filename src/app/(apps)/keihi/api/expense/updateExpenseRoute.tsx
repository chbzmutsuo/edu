import {NextRequest, NextResponse} from 'next/server'
import {updateExpense} from '@app/(apps)/keihi/actions/expense-actions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {id, data} = body

    if (!id || !data) return NextResponse.json({success: false, error: 'invalid'}, {status: 400})

    const result = await updateExpense(id, data)

    if (result.success) return NextResponse.json({success: true, data: result.data})
    return NextResponse.json({success: false, error: result.error}, {status: 500})
  } catch (error) {
    console.error('update expense api error', error)
    return NextResponse.json({success: false, error: 'server error'}, {status: 500})
  }
}
