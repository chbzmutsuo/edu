import {Days} from '@cm/class/Days/Days'
import prisma from 'src/lib/prisma'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'
import {NextRequest, NextResponse} from 'next/server'

import {isCron} from 'src/non-common/serverSideFunction'

// 顧客サブスクリプション売上記録を作成するCron API
export const GET = async (req: NextRequest) => {
  // Cron認証チェック
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }

  const theDate = new Date()

  // 現在の月の初日を取得
  const {firstDayOfMonth: yearMonth} = Days.month.getMonthDatum(new Date())

  // 月の初日かどうかをチェック
  const isFirstDay = theDate.getDate() === 1
  if (!isFirstDay) {
    return NextResponse.json({message: '初日ではありません。'})
  }

  // アクティブなサブスクリプションを取得
  const subscritpionList = await prisma.aqCustomerSubscription.findMany({
    where: {
      OR: [
        // startDate/endDate を使った期間判定（startDate が未設定でも後方互換で含める）
        {startDate: null, active: true},
        {
          startDate: {lte: yearMonth},
          OR: [{endDate: null}, {endDate: {gte: yearMonth}}],
        },
      ],
    },
    orderBy: [{aqCustomerId: `asc`}],
    include: {
      AqProduct: {},
      AqCustomer: {
        include: {
          AqCustomerPriceOption: {
            include: {AqPriceOption: {}},
          },
        },
      },
    },
  })

  // サブスクリプションリストから売上記録を作成するためのトランザクション実行
  const res = await doTransaction({
    transactionQueryList: subscritpionList.map((item, i) => {
      const aqCustomerSubscriptionId = item.id
      const {AqProduct, AqCustomer, remarks} = item
      const {AqCustomerPriceOption} = item.AqCustomer

      // 顧客固有の価格オプションを取得
      const theAqCustomerPriceOption = AqCustomerPriceOption.find(p => p.aqProductId === AqProduct.id)?.AqPriceOption as any
      const price = theAqCustomerPriceOption?.price ?? 0

      // ユニークキーの設定
      const unique_aqCustomerId_aqProductId_subscriptionYearMonth_aqCustomerSubscriptionId = {
        aqCustomerSubscriptionId: aqCustomerSubscriptionId,
        aqCustomerId: AqCustomer.id,
        aqProductId: AqProduct.id,
        subscriptionYearMonth: yearMonth,
      }

      // 売上記録のペイロード作成
      const payload = {
        date: yearMonth,
        quantity: 1,
        price,
        taxRate: AqProduct.taxRate,
        taxedPrice: price * (1 + AqProduct.taxRate / 100),
        remarks: [
          '[定期契約]',
          item?.AqCustomer?.companyName ?? item?.AqCustomer?.name ?? '',
          item?.maintananceYear && item?.maintananceMonth ? `メンテ:${item.maintananceYear}/${item.maintananceMonth}` : '',
          remarks ?? '',
        ]
          .filter(Boolean)
          .join(` `),
        subscriptionYearMonth: yearMonth,
      }

      // リレーション設定
      const relations = {
        AqCustomerSubscription: {connect: {id: aqCustomerSubscriptionId}},
        AqPriceOption: theAqCustomerPriceOption?.id ? {connect: {id: theAqCustomerPriceOption.id}} : undefined,
        AqCustomer: {connect: {id: AqCustomer.id}},
        AqProduct: {connect: {id: AqProduct.id}},
      }

      // Upsertクエリオブジェクトの作成
      const queryObject: Prisma.AqSaleRecordUpsertArgs = {
        where: {unique_aqCustomerId_aqProductId_subscriptionYearMonth_aqCustomerSubscriptionId},
        create: {
          ...payload,
          ...relations,
          // 売上カートも同時に作成
          AqSaleCart: {
            create: {
              aqCustomerId: AqCustomer.id,
              date: yearMonth,
              paymentMethod: AqCustomer.defaultPaymentMethod ?? '',
            },
          },
        },
        update: {...payload},
      }
      return {
        model: `aqSaleRecord`,
        method: `upsert`,
        queryObject,
      }
    }),
  })

  // 処理結果を返す
  return NextResponse.json({count: res.result})
}
