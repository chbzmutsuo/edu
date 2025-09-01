'use client'

import React, {useEffect, useState} from 'react'

import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {getDriveSchedules, linkEtcToSchedule} from '@app/(apps)/tbm/server-actions/etc-schedule-link'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {toastByResult} from '@cm/lib/ui/notifications'
import {Card} from '@cm/shadcn/ui/card'
import {Input} from '@cm/shadcn/ui/input'
import {cn} from '@cm/shadcn/lib/utils'

interface DriveScheduleSelectModalProps {
  vehicleId: number
  month: Date
  etcMeisaiId: number
  currentScheduleId?: number | null
  onLinkUpdated?: () => void
  handleClose?: () => void
}

export default function DriveScheduleSelectModal({
  vehicleId,
  month,
  etcMeisaiId,
  currentScheduleId,
  onLinkUpdated,
  handleClose,
}: DriveScheduleSelectModalProps) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(currentScheduleId || null)
  const [searchTerm, setSearchTerm] = useState('')

  // 運行スケジュールの取得
  useEffect(() => {
    if (vehicleId && month) {
      loadDriveSchedules()
    }
  }, [vehicleId, month])

  const loadDriveSchedules = async () => {
    setLoading(true)
    try {
      const result = await getDriveSchedules(vehicleId, month)
      if (result.success) {
        setSchedules(result.data || [])
      } else {
        console.error('運行スケジュール取得エラー:', result.message)
      }
    } catch (error) {
      console.error('運行スケジュール取得中にエラーが発生しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // 紐付け処理
  const handleLink = async () => {
    setLoading(true)

    try {
      const result = await linkEtcToSchedule(etcMeisaiId, selectedScheduleId)
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
      const result = await linkEtcToSchedule(etcMeisaiId, null)
      toastByResult(result)

      if (result.success) {
        setSelectedScheduleId(null)
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
  const filteredSchedules = searchTerm
    ? schedules.filter(
        schedule =>
          schedule.TbmRouteGroup?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatDate(schedule.date).includes(searchTerm)
      )
    : schedules

  return (
    <div className="w-full max-w-3xl p-4">
      <C_Stack className="gap-4">
        <div className="mb-4">
          <Input
            type="text"
            placeholder="検索（日付やルート名）"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-8">該当する運行データがありません</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {filteredSchedules.map(schedule => (
              <Card
                key={schedule.id}
                className={cn(
                  'mb-2 p-3 cursor-pointer hover:bg-gray-50',
                  selectedScheduleId === schedule.id ? 'bg-blue-50 border-blue-300' : ''
                )}
                onClick={() => setSelectedScheduleId(schedule.id)}
              >
                <R_Stack className="justify-between">
                  <div>
                    <div className="font-bold">{formatDate(schedule.date)}</div>
                    <div>{schedule.TbmRouteGroup?.name || '(ルート名なし)'}</div>
                  </div>
                  <div>
                    {schedule.TbmEtcMeisai && schedule.TbmEtcMeisai.length > 0 ? (
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {schedule.TbmEtcMeisai.length}件のETCグループと紐付け済み
                      </span>
                    ) : null}
                    {schedule.TbmEtcMeisai && schedule.TbmEtcMeisai.some(meisai => meisai.id === etcMeisaiId) ? (
                      <span className="text-xs bg-green-100 px-2 py-1 rounded ml-1">現在紐付け中</span>
                    ) : null}
                  </div>
                </R_Stack>
              </Card>
            ))}
          </div>
        )}

        <R_Stack className="justify-end gap-2 mt-4">
          {!!currentScheduleId && (
            <Button color="red" onClick={handleUnlink} disabled={loading}>
              紐付けを解除
            </Button>
          )}

          <Button
            color="blue"
            onClick={handleLink}
            disabled={loading || selectedScheduleId === null || selectedScheduleId === currentScheduleId}
          >
            紐付ける
          </Button>
        </R_Stack>
      </C_Stack>
    </div>
  )
}
