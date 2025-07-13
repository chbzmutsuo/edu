import {NextRequest, NextResponse} from 'next/server'
import prisma from 'src/lib/prisma'
import {getServerSession} from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    // 管理者権限チェック（必要に応じて）
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    console.log('🔄 [定期購読] → [定期契約] 一括更新を開始...')

    // 1. 現在の[定期購読]レコード数を確認
    const beforeCount = await prisma.aqSaleRecord.count({
      where: {
        remarks: {
          contains: '[定期購読]',
        },
      },
    })

    console.log(`📊 更新対象: ${beforeCount}件`)

    // 2. AqSaleRecord テーブルの一括更新
    const saleRecordResult = await prisma.$executeRaw`
      UPDATE "AqSaleRecord"
      SET "remarks" = REPLACE("remarks", '[定期購読]', '[定期契約]')
      WHERE "remarks" LIKE '%[定期購読]%'
    `

    // 3. AqCustomerSubscription テーブルの一括更新
    const subscriptionResult = await prisma.$executeRaw`
      UPDATE "AqCustomerSubscription"
      SET "remarks" = REPLACE("remarks", '[定期購読]', '[定期契約]')
      WHERE "remarks" LIKE '%[定期購読]%'
    `

    // 4. 更新後の確認
    const afterCount = await prisma.aqSaleRecord.count({
      where: {
        remarks: {
          contains: '[定期購読]',
        },
      },
    })

    const newContractCount = await prisma.aqSaleRecord.count({
      where: {
        remarks: {
          contains: '[定期契約]',
        },
      },
    })

    // 5. 結果をレスポンス
    const result = {
      success: true,
      message: '一括更新が完了しました',
      details: {
        beforeCount,
        afterCount,
        saleRecordUpdated: Number(saleRecordResult),
        subscriptionUpdated: Number(subscriptionResult),
        newContractCount,
        remainingSubscriptionCount: afterCount,
      },
    }

    console.log('✅ 更新完了:', result.details)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ 更新エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'データベース更新中にエラーが発生しました',
        details: error.message,
      },
      {status: 500}
    )
  }
}

// 現在の状況を確認するGETエンドポイント
export async function GET(req: NextRequest) {
  try {
    const subscriptionCount = await prisma.aqSaleRecord.count({
      where: {
        remarks: {
          contains: '[定期購読]',
        },
      },
    })

    const contractCount = await prisma.aqSaleRecord.count({
      where: {
        remarks: {
          contains: '[定期契約]',
        },
      },
    })

    // サンプルレコードを取得
    const sampleRecords = await prisma.aqSaleRecord.findMany({
      where: {
        OR: [{remarks: {contains: '[定期購読]'}}, {remarks: {contains: '[定期契約]'}}],
      },
      select: {
        id: true,
        remarks: true,
        date: true,
      },
      take: 10,
      orderBy: {createdAt: 'desc'},
    })

    return NextResponse.json({
      current_status: {
        subscription_count: subscriptionCount,
        contract_count: contractCount,
        total: subscriptionCount + contractCount,
      },
      sample_records: sampleRecords,
    })
  } catch (error) {
    return NextResponse.json({error: 'データ取得中にエラーが発生しました'}, {status: 500})
  }
}
