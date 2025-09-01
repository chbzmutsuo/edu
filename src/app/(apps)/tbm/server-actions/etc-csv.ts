'use server'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Days} from '@cm/class/Days/Days'

/**
 * 指定された月のETC利用明細データを取得する
 */
export async function getEtcRawDataByMonth(vehicleId: number, month: Date) {
  const yearMonth = new Date(month)
  const year = yearMonth.getFullYear()
  const monthNum = yearMonth.getMonth()

  const startDate = new Date(year, monthNum, 1)
  const endDate = new Date(year, monthNum + 1, 0)

  return await doStandardPrisma('EtcCsvRaw', 'findMany', {
    where: {
      tbmVehicleId: vehicleId,
      fromDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: [{fromDate: 'asc'}, {fromTime: 'asc'}],
    include: {
      TbmEtcMeisai: true,
    },
  })
}

/**
 * ETC利用明細データをインポートする
 */
export async function importEtcCsvData(data: {tbmVehicleId: number; month: Date; records: any[]}) {
  const {tbmVehicleId, month, records} = data

  const transactionQueries = records.map(item => {
    return {
      model: 'EtcCsvRaw',
      method: 'upsert',
      queryObject: {
        where: {
          unique_tbmVehicleId_fromDate_fromTime: {
            tbmVehicleId: item.tbmVehicleId,
            fromDate: item.fromDate,
            fromTime: item.fromTime,
          },
        },
        create: item,
        update: item,
      },
    }
  })

  return await doTransaction({
    transactionQueryList: transactionQueries,
  })
}

/**
 * 選択されたレコードをグループ化する
 */
export async function groupEtcRecords(records: any[], groupIndex: number) {
  if (records.length === 0) return {success: false, message: 'レコードが選択されていません'}

  try {
    const vehicleId = records[0].tbmVehicleId
    const month = new Date(records[0].fromDate)
    month.setDate(1) // 月の初日に設定

    // グループの合計金額を計算
    const sum = records.reduce((acc, item) => acc + item.fee, 0)

    // TbmEtcMeisaiを作成または更新
    const {result: meisai} = await doStandardPrisma('TbmEtcMeisai', 'upsert', {
      where: {
        unique_tbmVehicleId_groupIndex_month: {
          tbmVehicleId: vehicleId,
          groupIndex,
          month,
        },
      },
      update: {
        sum,
        info: records.map(record =>
          JSON.stringify({
            fromDatetime: `${Days.format.formatDate(record.fromDate)} ${record.fromTime}`,
            toDatetime: `${Days.format.formatDate(record.toDate)} ${record.toTime}`,
            fromIc: record.fromIc,
            toIc: record.toIc,
            originalFee: record.originalFee,
            discount: record.discountAmount,
            toll: record.fee,
            sum: record.totalAmount,
          })
        ),
      },
      create: {
        tbmVehicleId: vehicleId,
        groupIndex,
        month,
        sum,
        info: records.map(record =>
          JSON.stringify({
            fromDatetime: `${Days.format.formatDate(record.fromDate)} ${record.fromTime}`,
            toDatetime: `${Days.format.formatDate(record.toDate)} ${record.toTime}`,
            fromIc: record.fromIc,
            toIc: record.toIc,
            originalFee: record.originalFee,
            discount: record.discountAmount,
            toll: record.fee,
            sum: record.totalAmount,
          })
        ),
      },
    })

    // EtcCsvRawのisGroupedとtbmEtcMeisaiIdを更新
    const updateQueries = records.map(record => ({
      model: 'EtcCsvRaw',
      method: 'update',
      queryObject: {
        where: {id: record.id},
        data: {
          isGrouped: true,
          tbmEtcMeisaiId: meisai.id,
        },
      },
    }))

    const result = await doTransaction({
      transactionQueryList: updateQueries,
    })

    return {success: true, message: 'グルーピングが保存されました', result: meisai}
  } catch (error) {
    console.error('グルーピング更新中にエラーが発生しました:', error)
    return {success: false, message: 'グルーピング更新中にエラーが発生しました'}
  }
}

/**
 * グループを解除する
 */
export async function ungroupEtcRecords(meisaiId: number) {
  try {
    // グループに属するレコードを取得
    const {result: records} = await doStandardPrisma('EtcCsvRaw', 'findMany', {
      where: {
        tbmEtcMeisaiId: meisaiId,
      },
    })

    // EtcCsvRawのisGroupedとtbmEtcMeisaiIdをリセット
    const updateQueries = records.map(record => ({
      model: 'EtcCsvRaw',
      method: 'update',
      queryObject: {
        where: {id: record.id},
        data: {
          isGrouped: false,
          tbmEtcMeisaiId: null,
        },
      },
    }))

    // TbmEtcMeisaiを削除
    updateQueries.push({
      model: 'TbmEtcMeisai',
      method: 'delete',
      queryObject: {
        where: {id: meisaiId},
      },
    })

    const result = await doTransaction({
      transactionQueryList: updateQueries,
    })

    return {success: true, message: 'グループが解除されました'}
  } catch (error) {
    console.error('グループ解除中にエラーが発生しました:', error)
    return {success: false, message: 'グループ解除中にエラーが発生しました'}
  }
}
