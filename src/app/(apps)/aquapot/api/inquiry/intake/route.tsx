import prisma from 'src/lib/prisma'
import {NextRequest, NextResponse} from 'next/server'

// 受け口API: 外部アプリからの問い合わせデータを受け取り AqInquiry を作成
export const POST = async (req: NextRequest) => {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!process.env.AQUAPOT_INQUIRY_API_KEY || apiKey !== process.env.AQUAPOT_INQUIRY_API_KEY) {
      return NextResponse.json({success: false, message: 'Unauthorized'}, {status: 401})
    }

    const body = await req.json()

    // 必須: date
    if (!body?.date) {
      return NextResponse.json({success: false, message: 'date is required'}, {status: 400})
    }

    const data = await prisma.aqInquiry.create({
      data: {
        date: new Date(body.date),
        companyName: body.companyName ?? null,
        person: body.person ?? null,
        tel: body.tel ?? null,
        email: body.email ?? null,
        type: body.type ?? null,
        content: body.content ?? null,
        mailBody: body.mailBody ?? null,
        importance: body.importance ?? null,
        followRequired: !!body.followRequired,
        purchaseIntended: !!body.purchaseIntended,
        aqCustomerId: body.aqCustomerId ?? null,
      },
    })

    return NextResponse.json({success: true, id: data.id})
  } catch (error) {
    console.error('AqInquiry intake error', error)
    return NextResponse.json({success: false, message: 'internal error'}, {status: 500})
  }
}


