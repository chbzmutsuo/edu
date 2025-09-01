'use client'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Fields} from '@cm/class/Fields/Fields'
import React, {useEffect, useMemo, useState} from 'react'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Card} from '@cm/shadcn/ui/card'
import {Days} from '@cm/class/Days/Days'
import {toastByResult} from '@cm/lib/ui/notifications'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {NumHandler} from '@cm/class/NumHandler'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {cn} from '@cm/shadcn/lib/utils'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

// 型定義
interface EtcRecord {
  id: number
  fromDate: Date
  fromTime: string
  toDate: Date
  toTime: string
  fromIc: string
  toIc: string
  fee: number
  originalFee?: number | null
  discountAmount?: number | null
  tbmVehicleId: number
  isGrouped: boolean
  tbmEtcMeisaiId?: number | null
  TbmEtcMeisai?: any
  isGroupDetail?: boolean
  groupIndex?: number
}

interface GroupHeader {
  isGroupHeader: boolean
  meisaiId: number
  fromDate: Date
  fromTime: string
  toDate: Date
  toTime: string
  fromIc: string
  toIc: string
  fee: number
  records: EtcRecord[]
  groupIndex: number
}

type TableRecord = EtcRecord | GroupHeader

export default function EtcCsvImportPage() {
  const [csvData, setCsvData] = useState<any[]>([])
  const [etcRawData, setEtcRawData] = useState<EtcRecord[]>([])
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {firstDayOfMonth} = Days.month.getMonthDatum(new Date())

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      {
        id: `tbmVehicleId`,
        label: `車両`,
        form: {
          defaultValue: null,
        },
        forSelect: {config: getVehicleForSelectConfig({})},
      },
      {
        id: `month`,
        label: `月`,
        form: {
          defaultValue: firstDayOfMonth,
        },
        type: `month`,
      },
      {
        id: `csvData`,
        label: `CSVデータ`,
        form: {defaultValue: '', style: {maxHeight: 200, lineHeight: 1.2}},

        type: 'textarea',
      },
    ]).transposeColumns(),
  })

  // フォームデータが変更されたときに呼び出される
  useEffect(() => {
    if (latestFormData?.tbmVehicleId && latestFormData?.month) {
      handleFormChange('tbmVehicleId', latestFormData.tbmVehicleId)
      handleFormChange('month', latestFormData.month)
    }
  }, [latestFormData?.tbmVehicleId, latestFormData?.month])

  // CSVデータをインポートする関数
  const importCsvData = async data => {
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
          const parseJapaneseDate = dateStr => {
            const yearMonth = new Date(month)
            const year = yearMonth.getFullYear()

            const match = dateStr.match(/(\d+)月(\d+)日/)
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
            tbmVehicleId: parseInt(tbmVehicleId),
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
                tbmVehicleId: item.tbmVehicleId,
                fromDate: item.fromDate,
                fromTime: item.fromTime,
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
        setCsvData(parsedData)
        setSelectedMonth(month)
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
  const loadEtcRawData = async (vehicleId, month) => {
    if (!vehicleId || !month) return

    console.log('loadewd') //logs
    setIsLoading(true)
    try {
      const yearMonth = new Date(month)
      const year = yearMonth.getFullYear()
      const monthNum = yearMonth.getMonth()

      const startDate = new Date(year, monthNum, 1)
      const endDate = new Date(year, monthNum + 1, 0)

      const {result} = await doStandardPrisma('etcCsvRaw', 'findMany', {
        where: {
          tbmVehicleId: parseInt(vehicleId),
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

      if (result) {
        setEtcRawData(result)
      }
    } catch (error) {
      console.error('データ取得中にエラーが発生しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // グルーピングを更新する関数
  const updateGrouping = async (records, groupIndex) => {
    if (records.length === 0) return

    // 選択されたレコードが既にグループ化されていないか確認
    const alreadyGroupedRecords = records.filter(record => record.isGrouped)
    if (alreadyGroupedRecords.length > 0) {
      toastByResult({
        success: false,
        message: '既にグループ化されているレコードが含まれています。未グループのレコードのみ選択してください。',
      })
      return
    }

    setIsLoading(true)
    try {
      const vehicleId = records[0].tbmVehicleId
      const month = new Date(records[0].fromDate)
      month.setDate(1) // 月の初日に設定

      // グループの合計金額を計算
      const sum = records.reduce((acc, item) => acc + item.fee, 0)

      // 新しいグループを作成
      const {result: meisai} = await doStandardPrisma('tbmEtcMeisai', 'create', {
        data: {
          tbmVehicleId: vehicleId,
          groupIndex,
          month,
          sum,
          info: records.map(record =>
            JSON.stringify({
              fromDatetime: `${formatDate(record.fromDate)} ${record.fromTime}`,
              toDatetime: `${formatDate(record.toDate)} ${record.toTime}`,
              fromIc: record.fromIc,
              toIc: record.toIc,
              originalFee: record.originalFee,
              discount: record.discountAmount,
              toll: record.fee,
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

      await doTransaction({
        transactionQueryList: updateQueries,
      })

      // データを再読み込み
      if (latestFormData?.tbmVehicleId && latestFormData?.month) {
        loadEtcRawData(latestFormData.tbmVehicleId, latestFormData.month)
      }

      // 選択状態をクリア
      setSelectedRows({})

      toastByResult({success: true, message: 'グルーピングが保存されました'})
    } catch (error) {
      console.error('グルーピング更新中にエラーが発生しました:', error)
      toastByResult({success: false, message: 'グルーピング更新中にエラーが発生しました'})
    } finally {
      setIsLoading(false)
    }
  }

  // 選択状態を管理
  const [selectedRows, setSelectedRows] = useState<{[key: number]: boolean}>({})

  const toggleRowSelection = (id: number) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const selectedRecords = useMemo(() => {
    return etcRawData.filter(row => selectedRows[row.id])
  }, [etcRawData, selectedRows])

  // 車両または月が変更されたらデータをロード
  useEffect(() => {
    if (latestFormData?.tbmVehicleId && latestFormData?.month) {
      loadEtcRawData(latestFormData.tbmVehicleId, latestFormData.month)
    }
  }, [latestFormData?.tbmVehicleId, latestFormData?.month])

  // フォームの値が変更されたときに呼ばれるハンドラー
  const handleFormChange = (field, value) => {
    if ((field === 'tbmVehicleId' || field === 'month') && latestFormData?.tbmVehicleId && latestFormData?.month) {
      loadEtcRawData(latestFormData.tbmVehicleId, latestFormData.month)
    }
  }

  // 初期ロード時にデータを取得
  useEffect(() => {
    if (latestFormData?.tbmVehicleId && latestFormData?.month) {
      loadEtcRawData(latestFormData.tbmVehicleId, latestFormData.month)
    }
  }, [])

  // グループを解除する関数
  const ungroupRecords = async meisaiId => {
    if (!confirm('このグループを解除しますか？')) return

    setIsLoading(true)
    try {
      // グループに属するレコードを取得
      const records = etcRawData.filter(record => record.tbmEtcMeisaiId === meisaiId)

      if (!records.length) {
        toastByResult({success: false, message: 'グループに属するレコードが見つかりません'})
        return
      }

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

      // TbmEtcMeisaiを削除（別のトランザクションで実行）
      try {
        await doStandardPrisma('tbmEtcMeisai', 'delete', {
          where: {id: parseInt(meisaiId)},
        })
      } catch (error) {
        console.error('TbmEtcMeisai削除中にエラーが発生しました:', error)
      }

      const result = await doTransaction({
        transactionQueryList: updateQueries,
      })

      toastByResult(result)

      if (result.success) {
        // データを再読み込み
        if (latestFormData?.tbmVehicleId && latestFormData?.month) {
          loadEtcRawData(latestFormData.tbmVehicleId, latestFormData.month)
        }
      }
    } catch (error) {
      console.error('グループ解除中にエラーが発生しました:', error)
      toastByResult({success: false, message: 'グループ解除中にエラーが発生しました'})
    } finally {
      setIsLoading(false)
    }
  }

  // テーブル表示用
  const EtcDataTable = useMemo(() => {
    if (etcRawData.length === 0) return null

    // グループ済みのレコードを取得
    const groupedRecords: {[key: number]: EtcRecord[]} = {}
    etcRawData.forEach(record => {
      if (record.isGrouped && record.tbmEtcMeisaiId) {
        if (!groupedRecords[record.tbmEtcMeisaiId]) {
          groupedRecords[record.tbmEtcMeisaiId] = []
        }
        groupedRecords[record.tbmEtcMeisaiId].push(record)
      }
    })

    // グループ化されたデータを表示
    const groupedRows: TableRecord[] = []
    Object.keys(groupedRecords).forEach((meisaiId, index) => {
      const records = groupedRecords[parseInt(meisaiId)]
      // 日付順にソート
      records.sort((a, b) => {
        const dateA = new Date(`${a.fromDate.toISOString().split('T')[0]} ${a.fromTime}`)
        const dateB = new Date(`${b.fromDate.toISOString().split('T')[0]} ${b.fromTime}`)
        return dateA.getTime() - dateB.getTime()
      })

      const firstRecord = records[0]
      const lastRecord = records[records.length - 1]
      // const sum = records.reduce((acc, record) => acc + record.fee, 0)

      // グループヘッダーを追加
      groupedRows.push({
        isGroupHeader: true,
        meisaiId: parseInt(meisaiId),
        fromDate: firstRecord.fromDate,
        fromTime: firstRecord.fromTime,
        toDate: lastRecord.toDate,
        toTime: lastRecord.toTime,
        fromIc: firstRecord.fromIc,
        toIc: lastRecord.toIc,
        fee: firstRecord.fee,
        records,
        groupIndex: index, // グループインデックスを追加
      })

      // グループの内訳を追加（最初の1件はヘッダーなので含めない）
      records.forEach((record, recordIndex) => {
        if (recordIndex > 0) {
          // 最初の1件はヘッダーと同じなので表示しない
          const detailRecord = {...record, isGroupDetail: true, groupIndex: index}
          groupedRows.push(detailRecord)
        }
      })
    })

    // 未グループのレコード
    const ungroupedRecords = etcRawData.filter(record => !record.isGrouped)

    // すべてのレコードを日付順にソート（グループ内訳はソートに含めない）
    const sortableRecords = [...groupedRows.filter(r => !('isGroupDetail' in r)), ...ungroupedRecords] as TableRecord[]
    sortableRecords.sort((a, b) => {
      const dateA = new Date(`${a.fromDate.toISOString().split('T')[0]} ${a.fromTime}`)
      const dateB = new Date(`${b.fromDate.toISOString().split('T')[0]} ${b.fromTime}`)
      return dateA.getTime() - dateB.getTime()
    })

    // ソート後のレコードを展開（グループヘッダーの後にグループ内訳を挿入）
    const allRecords: TableRecord[] = []
    sortableRecords.forEach(record => {
      allRecords.push(record)
      if ('isGroupHeader' in record && record.isGroupHeader) {
        // このグループヘッダーに対応するグループ内訳を追加
        const details = groupedRows.filter(r => 'isGroupDetail' in r && r.isGroupDetail && r.groupIndex === record.groupIndex)
        allRecords.push(...details)
      }
    })

    const tableHeaders = [
      {label: '連番', isCheckbox: true},
      {label: 'グループ', isGroupHeader: true},
      {label: '利用年月日（自）'},
      {label: '時分（自）'},
      {label: '利用年月日（至）'},
      {label: '時分（至）'},
      {label: '利用IC（自）'},
      {label: '利用IC（至）'},
      {label: '通行料金'},

      {label: 'グループ料金'},
    ]

    return (
      <div className="max-h-[600px] max-w-[1000px] overflow-auto">
        <table
          className={cn(
            //
            'min-w-full divide-y divide-gray-200',
            '[&_td]:p-2',
            '[&_td]:whitespace-nowrap'
          )}
        >
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allRecords.map((record, i) => {
              if ('isGroupHeader' in record && record.isGroupHeader) {
                const groupFee = record.records.reduce((acc, record) => acc + record.fee, 0)
                // グループヘッダー行
                const bgColor = Number(record.groupIndex) % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'
                return (
                  <tr key={`group-${record.meisaiId}`} className={bgColor}>
                    <td>{i + 1}</td>

                    <td>
                      <R_Stack className={` flex-nowrap gap-0.5`}>
                        <button
                          onClick={() => ungroupRecords(record.meisaiId)}
                          className="text-xs px-2 py-1 bg-red-200 border-red-400 border hover:bg-red-300 rounded"
                          title="グループ解除"
                        >
                          {record.groupIndex + 1}
                        </button>
                      </R_Stack>
                    </td>
                    <td>{formatDate(record.fromDate)}</td>
                    <td>{record.fromTime}</td>
                    <td>{formatDate(record.toDate)}</td>
                    <td>{record.toTime}</td>
                    <td>{record.fromIc}</td>
                    <td>{record.toIc}</td>
                    <td className="font-bold">¥{NumHandler.WithUnit(record.fee, '円')}</td>
                    <td className="font-bold">¥{NumHandler.WithUnit(groupFee, '円')}</td>
                  </tr>
                )
              } else if ('isGroupDetail' in record && record.isGroupDetail) {
                // グループ内訳行

                const bgColor = Number(record.groupIndex) % 2 === 0 ? 'bg-blue-50' : 'bg-green-50'
                return (
                  <tr key={`detail-${record.id}`} className={bgColor}>
                    <td>{i + 1}</td>
                    <td className="pl-4">└</td>
                    <td>{formatDate(record.fromDate)}</td>
                    <td>{record.fromTime}</td>
                    <td>{formatDate(record.toDate)}</td>
                    <td>{record.toTime}</td>
                    <td>{record.fromIc}</td>
                    <td>{record.toIc}</td>
                    <td>¥{NumHandler.WithUnit(record.fee, '円')}</td>
                    <td>-</td>
                  </tr>
                )
              } else {
                // 通常の行（未グループ）
                const etcRecord = record as EtcRecord
                const isSelected = !!selectedRows[etcRecord.id]

                return (
                  <tr
                    key={`record-${etcRecord.id}`}
                    className={isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    onClick={() => toggleRowSelection(etcRecord.id)}
                    style={{cursor: 'pointer'}}
                  >
                    <td>{i + 1}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => {
                          // イベントの伝播を止めて、trのクリックイベントと重複しないようにする
                          e.stopPropagation()
                          toggleRowSelection(etcRecord.id)
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>
                    <td>{formatDate(etcRecord.fromDate)}</td>
                    <td>{etcRecord.fromTime}</td>
                    <td>{formatDate(etcRecord.toDate)}</td>
                    <td>{etcRecord.toTime}</td>
                    <td>{etcRecord.fromIc}</td>
                    <td>{etcRecord.toIc}</td>
                    <td>¥{NumHandler.WithUnit(etcRecord.fee, '円')}</td>
                    <td>-</td>
                  </tr>
                )
              }
            })}
          </tbody>
        </table>
      </div>
    )
  }, [etcRawData, selectedRows, toggleRowSelection])

  // 次のグループインデックスを取得
  const getNextGroupIndex = () => {
    // グループ化されたレコードからグループインデックスを取得
    const groupIndices = etcRawData.filter(record => record.TbmEtcMeisai).map(record => record.TbmEtcMeisai.groupIndex)

    // ユニークなグループインデックスを取得
    const uniqueIndices = [...new Set(groupIndices)]

    // 最大のグループインデックス + 1 を返す
    return uniqueIndices.length > 0 ? Math.max(...uniqueIndices) + 1 : 1
  }

  return (
    <FitMargin>
      <C_Stack className="gap-6">
        <h1 className="text-2xl font-bold">ETC利用明細インポート</h1>

        <R_Stack className={` items-start`}>
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">①データインポート</h2>
            <BasicForm
              {...{
                latestFormData,
                onSubmit: importCsvData,
              }}
            >
              <div className="mb-4">{/* CSVデータ入力フィールド */}</div>
              <Button disabled={isLoading}>{isLoading ? 'インポート中...' : 'CSVデータをインポート'}</Button>
            </BasicForm>
          </Card>

          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">②データ確認とグルーピング</h2>
            {etcRawData.length > 0 ? (
              <>
                <div className="mb-4">
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => updateGrouping(selectedRecords, getNextGroupIndex())}
                      disabled={isLoading}
                      className="mt-2"
                      disabled={selectedRecords.length === 0}
                    >
                      選択したレコードをグループ化
                    </Button>

                    {selectedRecords.some(record => record.isGrouped) && (
                      <p className="text-red-500 text-sm">
                        ※既にグループ化されているレコードが含まれています。未グループのレコードのみ選択してください。
                      </p>
                    )}
                  </div>
                </div>
                {EtcDataTable}
              </>
            ) : (
              <p>表示するデータがありません。車両と月を選択するか、CSVデータをインポートしてください。</p>
            )}
          </Card>
        </R_Stack>
      </C_Stack>
    </FitMargin>
  )
}
