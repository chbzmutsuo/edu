'use client'

import React, {useEffect, useState} from 'react'

import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {C_Stack, FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Card} from '@cm/shadcn/ui/card'
import {Button} from '@cm/components/styles/common-components/Button'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {NumHandler} from '@cm/class/NumHandler'
import {getEtcMeisaiBySchedule} from '@app/(apps)/tbm/server-actions/etc-schedule-link'
import EtcMeisaiSelectModal from '@app/(apps)/tbm/(components)/EtcScheduleLink/EtcMeisaiSelectModal'
import {Days} from '@cm/class/Days/Days'
import useModal from '@cm/components/utils/modal/useModal'

export default function UnkomeisaiDetailModal(props: {id: number}) {
  const {id} = props

  const [driveSchedule, setDriveSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [etcMeisaiList, setEtcMeisaiList] = useState<any[]>([])

  const EtcLinkModalReturn = useModal()

  // 運行スケジュールデータの取得
  useEffect(() => {
    if (id) {
      loadDriveSchedule()
    }
  }, [id])

  const loadDriveSchedule = async () => {
    setLoading(true)
    try {
      const {result} = await doStandardPrisma('tbmDriveSchedule', 'findUnique', {
        where: {id},
        include: {
          TbmVehicle: true,
          TbmRouteGroup: true,
          TbmBase: true,
          TbmEtcMeisai: {
            include: {
              EtcCsvRaw: true,
            },
          },
          User: true,
        },
      })

      if (result) {
        setDriveSchedule(result)

        // ETCデータの取得
        const etcResult = await getEtcMeisaiBySchedule(id)
        if (etcResult.success && etcResult.data) {
          setEtcMeisaiList(etcResult.data)
        }
      }
    } catch (error) {
      console.error('運行スケジュール取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // ETCデータの表示
  const renderEtcData = () => {
    if (!etcMeisaiList || etcMeisaiList.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500 mb-2">ETCデータが紐付けられていません</p>
          <Button color="blue" onClick={() => EtcLinkModalReturn.handleOpen()}>
            ETCデータと紐付ける
          </Button>
        </div>
      )
    }

    return (
      <div>
        <R_Stack className="justify-between mb-4">
          <h3 className="text-lg font-bold">ETCデータ一覧 ({etcMeisaiList.length}件)</h3>
          <Button color="blue" onClick={() => EtcLinkModalReturn.handleOpen()} size="sm">
            紐付け追加
          </Button>
        </R_Stack>

        <div className="space-y-4">
          {etcMeisaiList.map(etcMeisai => {
            const rawData = etcMeisai.EtcCsvRaw || []
            if (rawData.length === 0) {
              return (
                <Card key={etcMeisai.id} className="p-4">
                  <p>ETCデータの詳細がありません</p>
                </Card>
              )
            }

            // 日付順にソート
            rawData.sort((a, b) => {
              const dateA = new Date(`${a.fromDate.toISOString().split('T')[0]} ${a.fromTime}`)
              const dateB = new Date(`${b.fromDate.toISOString().split('T')[0]} ${b.fromTime}`)
              return dateA.getTime() - dateB.getTime()
            })

            const firstRaw = rawData[0]
            const lastRaw = rawData[rawData.length - 1]

            return (
              <Card key={etcMeisai.id} className="p-4">
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <R_Stack className="justify-between">
                    <div>
                      <p>
                        <span className="font-bold">グループ:</span> {etcMeisai.groupIndex + 1}
                      </p>
                      <p>
                        <span className="font-bold">出発:</span> {formatDate(firstRaw.fromDate)} {firstRaw.fromTime}
                      </p>
                      <p>
                        <span className="font-bold">到着:</span> {formatDate(lastRaw.toDate)} {lastRaw.toTime}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-bold">出発IC:</span> {firstRaw.fromIc}
                      </p>
                      <p>
                        <span className="font-bold">到着IC:</span> {lastRaw.toIc}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>
                        <span className="font-bold">合計金額:</span> ¥{NumHandler.WithUnit(etcMeisai.sum, '円')}
                      </p>
                      <Button
                        color="red"
                        size="sm"
                        onClick={async () => {
                          if (confirm('このETCグループの紐付けを解除しますか？')) {
                            try {
                              await doStandardPrisma('tbmEtcMeisai', 'update', {
                                where: {id: etcMeisai.id},
                                data: {tbmDriveScheduleId: null},
                              })
                              loadDriveSchedule()
                            } catch (error) {
                              console.error('紐付け解除エラー:', error)
                            }
                          }
                        }}
                      >
                        紐付け解除
                      </Button>
                    </div>
                  </R_Stack>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          日付
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          時間
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          出発IC
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          到着IC
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          料金
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rawData.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-3 py-2 whitespace-nowrap">{formatDate(item.fromDate)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {item.fromTime} - {item.toTime}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{item.fromIc}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{item.toIc}</td>
                          <td className="px-3 py-2 whitespace-nowrap">¥{NumHandler.WithUnit(item.fee, '円')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <FitMargin>
        <div className="text-center py-8">読み込み中...</div>
      </FitMargin>
    )
  }

  if (!driveSchedule) {
    return (
      <FitMargin>
        <div className="text-center py-8">運行スケジュールが見つかりません</div>
      </FitMargin>
    )
  }

  return (
    <FitMargin className={` p-4`}>
      <C_Stack className="gap-6">
        <h1 className="text-2xl font-bold">運行詳細</h1>

        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">基本情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <p>
              <span className="font-bold">日付:</span> {formatDate(driveSchedule.date)}
            </p>
            <p>
              <span className="font-bold">車両:</span> {driveSchedule.TbmVehicle?.vehicleNumber}
            </p>
            <p>
              <span className="font-bold">便名:</span> {driveSchedule.TbmRouteGroup?.name}
            </p>
            <p>
              <span className="font-bold">路線名:</span> {driveSchedule.TbmRouteGroup?.routeName}
            </p>

            <p>
              <span className="font-bold">ドライバー:</span> {driveSchedule.User?.name}
            </p>
            <p>
              <span className="font-bold">拠点:</span> {driveSchedule.TbmBase?.name}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">ETCデータ</h2>
          {renderEtcData()}
        </Card>
      </C_Stack>

      {/* ETC紐付けモーダル */}
      <EtcLinkModalReturn.Modal>
        <div className={` p-4`}>
          {driveSchedule && driveSchedule.TbmVehicle && (
            <EtcMeisaiSelectModal
              vehicleId={driveSchedule.tbmVehicleId}
              month={Days.month.getMonthDatum(driveSchedule.date).firstDayOfMonth}
              driveScheduleId={driveSchedule.id}
              handleClose={EtcLinkModalReturn.handleClose}
              onLinkUpdated={() => {
                // 紐付け更新後にデータを再読み込み
                loadDriveSchedule()
              }}
            />
          )}
        </div>
      </EtcLinkModalReturn.Modal>
    </FitMargin>
  )
}
