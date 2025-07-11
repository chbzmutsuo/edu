import {Days} from '@class/Days/Days'
import prisma from 'src/lib/prisma'
import {doTransaction} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'
import {NextRequest, NextResponse} from 'next/server'

import {isCron} from 'src/non-common/serverSideFunction'

export const GET = async (req: NextRequest) => {
  if ((await isCron({req})) === false) {
    const res = {success: false, message: `Unauthorized`, result: null}
    const status = {status: 401, statusText: `Unauthorized`}
    return NextResponse.json(res, status)
  }
  let result

  // 現在の日付から月の初日を取得し、yearMonthに格納

  const now = new Date()

  const {firstDayOfMonth} = Days.month.getMonthDatum(now)
  const yearMonth = firstDayOfMonth as Date

  // yearMonthの年と月をキーとして結合

  // 在庫管理中の製品リストを取得
  const productList = await prisma.aqProduct.findMany({
    where: {inInventoryManagement: true},
    include: {AqInventoryRegister: {}, AqSaleRecord: {}},
  })

  // トランザクションを実行し、各製品の在庫を更新
  const res = await doTransaction({
    transactionQueryList: productList.map(aqProduct => {
      const {AqInventoryRegister, AqSaleRecord, id: aqProductId} = aqProduct
      // 購入数量の合計を計算
      const totalPurchaseQuantity = AqInventoryRegister.reduce((acc, curr) => acc + curr.quantity, 0)
      // 販売数量の合計を計算
      const totalSaleQuantity = AqSaleRecord.reduce((acc, curr) => acc + curr.quantity, 0)
      // 残りの数量を計算
      const rest = Number(totalPurchaseQuantity - totalSaleQuantity)

      const unique_aqProductId_yearMonth: Prisma.AqInventoryByMonthUnique_aqProductId_yearMonthCompoundUniqueInput = {
        aqProductId,
        yearMonth,
      }

      const payload = {...unique_aqProductId_yearMonth, count: rest}

      const queryObject = {
        where: {
          unique_aqProductId_yearMonth,
        },
        create: payload,
        update: payload,
      }

      // アップサートのためのオブジェクトを返す
      return {
        model: `aqInventoryByMonth`,
        method: `upsert`,
        queryObject,
      }
    }),
  })

  return NextResponse.json(res)
}
