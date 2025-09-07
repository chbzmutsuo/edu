import {useState, useEffect} from 'react'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {EtcRecord} from '../types'

export const useEtcData = () => {
  const [etcRawData, setEtcRawData] = useState<EtcRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // CSVデータをインポートする関数
  const importCsvData = async (data: {tbmVehicleId: number; month: Date; csvData: string}) => {
    setIsLoading(true)
    try {
      const {tbmVehicleId, month, csvData} = data

      if (!tbmVehicleId || !month || !csvData) {
        toastByResult({success: false, message: '必要な情報がすべて入力されていません'})
        return
      }

      // CSVデータをパース
      const rows = csvData.trim().split('\n')
      const parsedData = rows
        .map(row => {
          const columns = row.split('\t')
          if (columns.length < 9) return null // 不正な行はスキップ

          // 日付の処理（例: "3月1日" → 日付オブジェクト）
          const parseJapaneseDate = (dateStr: string) => {
            const yearMonth = new Date(month)
            const year = yearMonth.getFullYear()

            // 「3月1日」「YYYY/MM/DD」「YYYY-MM-DD」など複数フォーマットに対応
            let match = dateStr.match(/(\d+)月(\d+)日/)
            if (!match) {
              // eslint-disable-next-line no-useless-escape
              match = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/)
              if (match) {
                // YYYY/MM/DDまたはYYYY-MM-DD
                // match[1]: 年, match[2]: 月, match[3]: 日
                return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
              }
            }
            if (!match) return null

            const monthNum = parseInt(match[1]) - 1 // JavaScriptの月は0から始まる
            const day = parseInt(match[2])

            return new Date(year, monthNum, day)
          }

          const fromDate = parseJapaneseDate(columns[0])
          const toDate = parseJapaneseDate(columns[2])

          if (!fromDate || !toDate) return null

          return {
            fromDate,
            fromTime: columns[1],
            toDate,
            toTime: columns[3],
            fromIc: columns[4],
            toIc: columns[5],
            originalFee: columns[6] ? parseFloat(columns[6]) : null,
            discountAmount: columns[7] ? parseFloat(columns[7]) : null,
            fee: parseFloat(columns[8]) || 0,
            // 通行料金までのデータのみ取得
            tbmVehicleId: tbmVehicleId,
            isGrouped: false, // デフォルトはグルーピングなし
          }
        })
        .filter(Boolean)

      // データをDBに保存
      const transactionQueries = parsedData.map(item => {
        return {
          model: 'EtcCsvRaw',
          method: 'upsert',
          queryObject: {
            where: {
              unique_tbmVehicleId_fromDate_fromTime: {
                tbmVehicleId: item?.tbmVehicleId,
                fromDate: item?.fromDate,
                fromTime: item?.fromTime,
              },
            },
            ...createUpdate(item),
          },
        }
      })

      const result = await doTransaction({
        transactionQueryList: transactionQueries,
      })

      toastByResult(result)

      if (result.success) {
        loadEtcRawData(tbmVehicleId, month)
      }
    } catch (error) {
      console.error('インポート中にエラーが発生しました:', error)
      toastByResult({success: false, message: 'インポート中にエラーが発生しました'})
    } finally {
      setIsLoading(false)
    }
  }

  // EtcCsvRawデータをロードする関数
  const loadEtcRawData = async (vehicleId: number, month: Date) => {
    if (!vehicleId || !month) return

    setIsLoading(true)
    try {
      const yearMonth = new Date(month)
      const year = yearMonth.getFullYear()
      const monthNum = yearMonth.getMonth()

      const startDate = new Date(year, monthNum, 1)
      const endDate = new Date(year, monthNum + 1, 0)

      const {result} = await doStandardPrisma('etcCsvRaw', 'findMany', {
        where: {
          tbmVehicleId: vehicleId,
          fromDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: [{fromDate: 'asc'}, {fromTime: 'asc'}],
        include: {
          TbmEtcMeisai: {
            include: {
              TbmDriveSchedule: {
                include: {
                  TbmRouteGroup: true,
                  User: true,
                },
              },
            },
          },
        },
      })

      if (result) {
        setEtcRawData(result)
      }
    } catch (error) {
      console.error('データ取得中にエラーが発生しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    etcRawData,
    isLoading,
    importCsvData,
    loadEtcRawData,
  }
}
