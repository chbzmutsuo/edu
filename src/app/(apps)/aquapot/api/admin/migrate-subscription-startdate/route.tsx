import prisma from 'src/lib/prisma'
import {NextRequest, NextResponse} from 'next/server'

// active=true かつ startDate 未設定の定期契約に対し、実行日を startDate として一括設定
export const POST = async (req: NextRequest) => {
  const today = new Date()
  const result = await prisma.aqCustomerSubscription.updateMany({
    where: {active: true, startDate: null},
    data: {startDate: today},
  })
  return NextResponse.json({updated: result.count})
}

export const GET = POST
