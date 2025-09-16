import React, {useState, useEffect} from 'react'
import {Button} from '@cm/components/styles/common-components/Button'
import {Fields} from '@cm/class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {toastByResult} from '@cm/lib/ui/notifications'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {NumHandler} from '@cm/class/NumHandler'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

interface EtcScheduleLinkModalProps {
  etcMeisaiId: number
  scheduleId: number | null
  onClose: () => void
  onUpdate: () => void
}

export const EtcScheduleLinkModal: React.FC<EtcScheduleLinkModalProps> = ({etcMeisaiId, scheduleId, onClose, onUpdate}) => {
  const [etcMeisai, setEtcMeisai] = useState<any>(null)
  const [availableSchedules, setAvailableSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: new Fields([
      {
        id: 'tbmDriveScheduleId',
        label: '運行明細',
        forSelect: {
          optionsOrOptionFetcher: availableSchedules.map(schedule => ({
            name: `${formatDate(schedule.date, 'MM/DD')} ${schedule.TbmRouteGroup?.name || ''} ${schedule.User?.name || ''}`,
            label: `${formatDate(schedule.date, 'MM/DD')} ${schedule.TbmRouteGroup?.name || ''} ${schedule.User?.name || ''}`,
            value: schedule.id,
          })),
        },
      },
      {
        id: 'feeType',
        label: '料金種別',
        forSelect: {
          optionsOrOptionFetcher: [
            {name: '郵便', label: '郵便', value: 'postal'},
            {name: '一般', label: '一般', value: 'general'},
          ],
        },
        form: {
          defaultValue: 'postal',
        },
      },
    ]).transposeColumns(),
    formData: {
      tbmDriveScheduleId: scheduleId,
      feeType: 'postal',
    },
  })

  // ETCデータと利用可能な運行明細を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ETCデータを取得
        const etcResponse = await doStandardPrisma('tbmEtcMeisai', 'findUnique', {
          where: {id: etcMeisaiId},
          include: {
            TbmVehicle: true,
            TbmDriveSchedule: {
              include: {
                TbmRouteGroup: true,
                User: true,
              },
            },
          },
        })

        if (etcResponse.result) {
          setEtcMeisai(etcResponse.result)

          // 同じ月の運行明細を取得（同じ車両のもの）
          const monthStart = new Date(etcResponse.result.month)
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

          const schedulesResponse = await doStandardPrisma('tbmDriveSchedule', 'findMany', {
            where: {
              tbmVehicleId: etcResponse.result.tbmVehicleId,
              date: {
                gte: monthStart,
                lte: monthEnd,
              },
              approved: true, // 承認済みのもののみ
            },
            include: {
              TbmRouteGroup: true,
              User: true,
            },
            orderBy: {date: 'asc'},
          })

          if (schedulesResponse.result) {
            setAvailableSchedules(schedulesResponse.result)
          }
        }
      } catch (error) {
        console.error('データ取得エラー:', error)
      }
    }

    fetchData()
  }, [etcMeisaiId])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const {tbmDriveScheduleId, feeType} = data

      if (tbmDriveScheduleId) {
        // 運行明細にETC料金を反映
        const feeField = feeType === 'postal' ? 'O_postalHighwayFee' : 'Q_generalHighwayFee'

        await doStandardPrisma('tbmDriveSchedule', 'update', {
          where: {id: tbmDriveScheduleId},
          data: {
            [feeField]: etcMeisai?.sum || 0,
          },
        })

        // ETCデータに運行明細IDを紐付け
        const result = await doStandardPrisma('tbmEtcMeisai', 'update', {
          where: {id: etcMeisaiId},
          data: {
            tbmDriveScheduleId: tbmDriveScheduleId,
          },
        })

        toastByResult(result)
      } else {
        // 紐付け解除の場合
        const result = await doStandardPrisma('tbmEtcMeisai', 'update', {
          where: {id: etcMeisaiId},
          data: {
            tbmDriveScheduleId: null,
          },
        })

        // 運行明細からETC料金を削除
        if (scheduleId) {
          await doStandardPrisma('tbmDriveSchedule', 'update', {
            where: {id: scheduleId},
            data: {
              O_postalHighwayFee: null,
              Q_generalHighwayFee: null,
            },
          })
        }

        toastByResult(result)
      }

      onUpdate()
      onClose()
    } catch (error) {
      console.error('紐付けエラー:', error)
      toastByResult({success: false, message: '紐付け処理に失敗しました'})
    } finally {
      setIsLoading(false)
    }
  }

  if (!etcMeisai) {
    return <div>データを読み込み中...</div>
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-4">ETC利用明細の運行紐付け</h3>

        <C_Stack className="mb-4 gap-2">
          <div className="text-sm text-gray-600">
            <strong>車両:</strong> {etcMeisai.TbmVehicle?.vehicleNumber}
          </div>
          <div className="text-sm text-gray-600">
            <strong>対象月:</strong> {formatDate(etcMeisai.month, 'YYYY年MM月')}
          </div>
          <div className="text-sm text-gray-600">
            <strong>合計金額:</strong> {NumHandler.WithUnit(etcMeisai.sum, '円')}
          </div>
          {etcMeisai.TbmDriveSchedule && (
            <div className="text-sm text-blue-600">
              <strong>現在の紐付け:</strong> {formatDate(etcMeisai.TbmDriveSchedule.date, 'MM/DD')}{' '}
              {etcMeisai.TbmDriveSchedule.TbmRouteGroup?.name}
            </div>
          )}
        </C_Stack>

        <BasicForm latestFormData={latestFormData} onSubmit={handleSubmit}>
          <R_Stack className="gap-3">
            <Button type="button" color="gray" onClick={onClose} disabled={isLoading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '処理中...' : '紐付け実行'}
            </Button>
          </R_Stack>
        </BasicForm>
      </div>
    </div>
  )
}
