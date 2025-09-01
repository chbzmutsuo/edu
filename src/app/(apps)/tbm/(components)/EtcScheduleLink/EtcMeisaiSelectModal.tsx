'use client'

import React, {useEffect, useState} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {getUnlinkedEtcMeisai, linkScheduleToEtc} from '@app/(apps)/tbm/server-actions/etc-schedule-link'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {toastByResult} from '@cm/lib/ui/notifications'
import {Card} from '@cm/shadcn/ui/card'
import {Input} from '@cm/shadcn/ui/input'
import {cn} from '@cm/shadcn/lib/utils'
import {NumHandler} from '@cm/class/NumHandler'

interface EtcMeisaiSelectModalProps {
  vehicleId: number
  month: Date
  driveScheduleId: number
  currentEtcMeisaiId?: number | null
  onLinkUpdated?: () => void
  handleClose?: () => void
}

export default function EtcMeisaiSelectModal({
  vehicleId,
  month,
  driveScheduleId,
  currentEtcMeisaiId,
  onLinkUpdated,
  handleClose,
}: EtcMeisaiSelectModalProps) {
  const [etcMeisaiList, setEtcMeisaiList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEtcMeisaiId, setSelectedEtcMeisaiId] = useState<number | null>(currentEtcMeisaiId || null)
  const [searchTerm, setSearchTerm] = useState('')

  // ETCグループの取得
  useEffect(() => {
    if (vehicleId && month) {
      loadEtcMeisaiList()
    }
  }, [vehicleId, month])

  const loadEtcMeisaiList = async () => {
    setLoading(true)
    try {
      // 未紐付けのETCグループを取得
      const unlinkedResult = await getUnlinkedEtcMeisai(vehicleId, month)

      // 現在の運行スケジュールに紐付けられているETCグループを取得
      const {result: linkedEtcMeisai} = await doStandardPrisma('tbmEtcMeisai', 'findMany', {
        where: {
          tbmVehicleId: vehicleId,
          month: {
            gte: new Date(month.getFullYear(), month.getMonth(), 1),
            lte: new Date(month.getFullYear(), month.getMonth() + 1, 0),
          },
        },
        include: {
          EtcCsvRaw: true,
        },
        orderBy: {
          groupIndex: 'asc',
        },
      })

      if (unlinkedResult.success) {
        // すべてのETCグループを結合
        const allEtcMeisai = [...(linkedEtcMeisai || []), ...(unlinkedResult.data || [])]

        // 重複を除去
        const uniqueEtcMeisai = allEtcMeisai.filter((meisai, index, self) => index === self.findIndex(m => m.id === meisai.id))

        setEtcMeisaiList(uniqueEtcMeisai)
      } else {
        console.error('ETCグループ取得エラー:', unlinkedResult.message)
      }
    } catch (error) {
      console.error('ETCグループ取得中にエラーが発生しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // 紐付け処理
  const handleLink = async () => {
    setLoading(true)
    try {
      const result = await linkScheduleToEtc(driveScheduleId, selectedEtcMeisaiId)
      toastByResult(result)

      if (result.success) {
        if (onLinkUpdated) {
          onLinkUpdated()
        }
      }
    } catch (error) {
      console.error('紐付け処理中にエラーが発生しました:', error)
      toastByResult({success: false, message: '紐付け処理中にエラーが発生しました'})
    } finally {
      setLoading(false)
    }
  }

  // 紐付け解除
  const handleUnlink = async () => {
    if (!confirm('紐付けを解除してもよろしいですか？')) return

    setLoading(true)
    try {
      const result = await linkScheduleToEtc(driveScheduleId, null)
      toastByResult(result)

      if (result.success) {
        setSelectedEtcMeisaiId(null)
        if (onLinkUpdated) {
          onLinkUpdated()
        }
      }
    } catch (error) {
      console.error('紐付け解除中にエラーが発生しました:', error)
      toastByResult({success: false, message: '紐付け解除中にエラーが発生しました'})
    } finally {
      setLoading(false)
    }
  }

  // 検索フィルタリング
  const filteredEtcMeisai = searchTerm
    ? etcMeisaiList.filter(item => {
        // ETCの情報から検索
        const rawData = item.EtcCsvRaw || []
        return rawData.some(
          (raw: any) =>
            raw.fromIc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            raw.toIc?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : etcMeisaiList

  // ETCグループの表示用情報を取得
  const getEtcMeisaiDisplayInfo = (etcMeisai: any) => {
    const rawData = etcMeisai.EtcCsvRaw || []
    if (rawData.length === 0) return {fromIc: '不明', toIc: '不明', date: null}

    // 最初と最後のレコードを取得
    rawData.sort((a: any, b: any) => {
      const dateA = new Date(`${a.fromDate.toISOString().split('T')[0]} ${a.fromTime}`)
      const dateB = new Date(`${b.fromDate.toISOString().split('T')[0]} ${b.fromTime}`)
      return dateA.getTime() - dateB.getTime()
    })

    const firstRaw = rawData[0]
    const lastRaw = rawData[rawData.length - 1]

    return {
      fromIc: firstRaw.fromIc,
      toIc: lastRaw.toIc,
      date: firstRaw.fromDate,
      sum: etcMeisai.sum,
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <C_Stack className="gap-4">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="検索（ICなど）"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : filteredEtcMeisai.length === 0 ? (
          <div className="text-center py-8">該当するETCデータがありません</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {filteredEtcMeisai.map(etcMeisai => {
              const info = getEtcMeisaiDisplayInfo(etcMeisai)
              return (
                <Card
                  key={etcMeisai.id}
                  className={cn(
                    'mb-2 p-3 cursor-pointer hover:bg-gray-50',
                    selectedEtcMeisaiId === etcMeisai.id ? 'bg-blue-50 border-blue-300' : ''
                  )}
                  onClick={() => setSelectedEtcMeisaiId(etcMeisai.id)}
                >
                  <R_Stack className="justify-between">
                    <div>
                      <div className="font-bold">グループ {etcMeisai.groupIndex + 1}</div>
                      <div>{info.date ? formatDate(info.date) : ''}</div>
                      <div>
                        {info.fromIc} → {info.toIc}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">¥{NumHandler.WithUnit(info.sum, '円')}</div>
                      {etcMeisai.id === currentEtcMeisaiId && (
                        <span className="text-xs bg-green-100 px-2 py-1 rounded">現在紐付け中</span>
                      )}
                    </div>
                  </R_Stack>
                </Card>
              )
            })}
          </div>
        )}

        <R_Stack className="justify-end gap-2 mt-4">
          {currentEtcMeisaiId && (
            <Button color="red" onClick={handleUnlink} disabled={loading}>
              紐付けを解除
            </Button>
          )}
          <Button color="gray" onClick={handleClose} disabled={loading}>
            キャンセル
          </Button>
          <Button
            color="blue"
            onClick={handleLink}
            disabled={loading || selectedEtcMeisaiId === null || selectedEtcMeisaiId === currentEtcMeisaiId}
          >
            紐付ける
          </Button>
        </R_Stack>
      </C_Stack>
    </div>
  )
}
