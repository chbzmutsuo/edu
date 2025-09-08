'use client'

import React, {useState, useEffect} from 'react'
import {Truck, Calendar, Plus, Clock, MapPin} from 'lucide-react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getReservations} from '../../(builders)/serverActions'
import {
  getDeliveryGroupsByDate,
  createDeliveryGroup,
  assignReservationToGroup,
  moveReservationToGroup,
  sortGroupReservationsByDeliveryTime,
  generateGroupGoogleMapUrl,
} from '../../(builders)/deliveryTeamActions'
import {Reservation, DeliveryGroup} from '../../types'

import useModal from '@cm/components/utils/modal/useModal'
import {formatPhoneNumber} from '../../utils/phoneUtils'
import DeliveryRouteMap from '../../components/DeliveryRouteMap'
import TravelTimeCalculator from '../../components/TravelTimeCalculator'
import {toast, ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@shadcn/ui/select'
import {Button} from '@shadcn/ui/button'
import {Input} from '@shadcn/ui/input'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {R_Stack} from '@cm/components/styles/common-components/common-components'

export default function DeliveryRoutePage() {
  const [date, setDate] = useState(formatDate(new Date()))
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [deliveryGroups, setDeliveryGroups] = useState<DeliveryGroup[]>([])
  const [unassignedReservations, setUnassignedReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [teamName, setTeamName] = useState('')
  const [selectedReservations, setSelectedReservations] = useState<number[]>([])
  const [movingReservation, setMovingReservation] = useState<{
    reservationId: number
    fromGroupId: number
    reservation: Reservation
  } | null>(null)
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null)

  const MapModalReturn = useModal()
  const TeamModalReturn = useModal()
  const MoveModalReturn = useModal()

  const {session} = useGlobal()

  useEffect(() => {
    loadData()
  }, [date])

  const loadData = async () => {
    setLoading(true)
    try {
      // 予約データを取得
      const reservationData = await getReservations({
        startDate: date,
        endDate: date,
      })
      setReservations(reservationData as Reservation[])

      // 配達グループを取得
      const groupData = await getDeliveryGroupsByDate(date)
      setDeliveryGroups(groupData as DeliveryGroup[])

      // 未割り当ての予約を特定
      updateUnassignedReservations(reservationData as Reservation[], groupData as DeliveryGroup[])
    } catch (error) {
      console.error('データの取得に失敗しました:', error)
      toast.error('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 未割り当ての予約を特定する関数
  const updateUnassignedReservations = (allReservations: Reservation[], groups: DeliveryGroup[]) => {
    // すべての割り当て済み予約IDを取得
    const assignedIds = new Set<number>()
    groups.forEach(group => {
      group.groupReservations?.forEach(gr => {
        assignedIds.add(gr.sbmReservationId)
      })
    })

    // 割り当てられていない予約をフィルタリング
    const unassigned = allReservations.filter(r => !assignedIds.has(r.id))
    setUnassignedReservations(unassigned)
  }

  const handleCreateTeam = async () => {
    if (!teamName) {
      toast.error('チーム名を入力してください')
      return
    }

    try {
      // チーム作成処理
      const result = await createDeliveryGroup(teamName, new Date(date), session?.id || 0, session?.name || '不明')

      if (result.success && result.group) {
        toast.success('チームを作成しました')

        // 新しいチームをリストに追加
        setDeliveryGroups([...deliveryGroups, result.group])
        setTeamName('')
        TeamModalReturn.handleClose()

        // 選択された予約があれば割り当て
        if (selectedReservations.length > 0) {
          for (const reservationId of selectedReservations) {
            await assignReservationToGroup(result.group.id, reservationId)
          }

          // データを再読み込み
          loadData()
        }
      } else {
        toast.error(result.error || 'チームの作成に失敗しました')
      }
    } catch (error) {
      console.error('チーム作成エラー:', error)
      toast.error('チームの作成に失敗しました')
    }
  }

  const handleAssignReservation = async (groupId: number, reservationId: number) => {
    try {
      const result = await assignReservationToGroup(groupId, reservationId)

      if (result.success) {
        toast.success('予約をチームに割り当てました')

        // データを再読み込み
        loadData()
      } else {
        toast.error(result.error || '予約の割り当てに失敗しました')
      }
    } catch (error) {
      console.error('予約割り当てエラー:', error)
      toast.error('予約の割り当てに失敗しました')
    }
  }

  const handleMoveReservation = async () => {
    if (!movingReservation || !targetGroupId) {
      toast.error('移動先のチームを選択してください')
      return
    }

    try {
      const result = await moveReservationToGroup(movingReservation.reservationId, movingReservation.fromGroupId, targetGroupId)

      if (result.success) {
        toast.success('予約を移動しました')

        // モーダルを閉じる
        MoveModalReturn.handleClose()
        setMovingReservation(null)
        setTargetGroupId(null)

        // データを再読み込み
        loadData()
      } else {
        toast.error(result.error || '予約の移動に失敗しました')
      }
    } catch (error) {
      console.error('予約移動エラー:', error)
      toast.error('予約の移動に失敗しました')
    }
  }

  const handleSortByDeliveryTime = async (groupId: number) => {
    try {
      const result = await sortGroupReservationsByDeliveryTime(groupId)

      if (result.success) {
        toast.success('納品時間順に並べ替えました')

        // データを再読み込み
        loadData()
      } else {
        toast.error(result.error || '並べ替えに失敗しました')
      }
    } catch (error) {
      console.error('並べ替えエラー:', error)
      toast.error('並べ替えに失敗しました')
    }
  }

  const handleGenerateMapUrl = async (groupId: number) => {
    try {
      const result = await generateGroupGoogleMapUrl(groupId)

      if (result.success && result.url) {
        // 新しいタブでURLを開く
        window.open(result.url, '_blank')

        toast.success('Google Mapを開きました')
      } else {
        toast.error(result.error || 'マップURLの生成に失敗しました')
      }
    } catch (error) {
      console.error('マップURL生成エラー:', error)
      toast.error('マップURLの生成に失敗しました')
    }
  }

  const toggleReservationSelection = (id: number) => {
    setSelectedReservations(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  // 予約を特定のチームに移動するためのモーダルを開く
  const openMoveModal = (reservationId: number, fromGroupId: number) => {
    // 予約情報を取得
    const group = deliveryGroups.find(g => g.id === fromGroupId)
    const groupReservation = group?.groupReservations?.find(gr => gr.sbmReservationId === reservationId)
    const reservation = reservations.find(r => r.id === reservationId)

    if (!reservation) {
      toast.error('予約情報が見つかりません')
      return
    }

    setMovingReservation({
      reservationId,
      fromGroupId,
      reservation,
    })

    MoveModalReturn.handleOpen()
  }

  const getReservationById = (id: number): Reservation | undefined => {
    return reservations.find(r => r.id === id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="space-y-6 p-4">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">配達ルート管理</h1>
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={() => TeamModalReturn.handleOpen()} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-1" size={16} /> 新規チーム作成
            </Button>
          </div>
        </div>

        <R_Stack className={` items-stretch gap-10 flex-nowrap`}>
          {/* 未割り当ての予約リスト */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="mr-2" size={20} />
                未割り当ての予約 ({unassignedReservations.length}件)
              </h2>
            </div>

            <div className="overflow-x-auto">
              {unassignedReservations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">未割り当ての予約はありません</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客情報</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住所</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unassignedReservations.map(reservation => (
                      <tr key={reservation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatDate(reservation.deliveryDate, 'HH:mm')}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                          <div className="text-xs text-gray-500">{formatPhoneNumber(reservation.phoneNumber || '')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {reservation.prefecture}
                            {reservation.city}
                            {reservation.street}
                          </div>
                          {reservation.building && <div className="text-xs text-gray-500">{reservation.building}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {reservation.items?.map((item, index) => (
                              <div key={index} className="text-sm">
                                {item.productName} x{item.quantity}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          {deliveryGroups.length > 0 && (
                            <Select onValueChange={value => handleAssignReservation(parseInt(value), reservation.id)}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="チームを選択" />
                              </SelectTrigger>
                              <SelectContent className={`bg-white`}>
                                {deliveryGroups.map(group => (
                                  <SelectItem key={group.id} value={group.id.toString()}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Button
                            onClick={() => MapModalReturn.handleOpen({reservationId: reservation.id})}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            地図
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          {/* 配達チームリスト */}
          <R_Stack className="space-y-6 items-stretch">
            {deliveryGroups.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                この日の配達チームはありません。新規チームを作成してください。
              </div>
            ) : (
              deliveryGroups.map(group => (
                <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Truck className="mr-2" size={20} />
                      {group.name} ({group.groupReservations?.length || 0}件)
                    </h2>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSortByDeliveryTime(group.id)} variant="outline" size="sm">
                        <Clock className="mr-1" size={14} /> 納品時間順設定
                      </Button>
                      <Button onClick={() => handleGenerateMapUrl(group.id)} variant="outline" size="sm">
                        <MapPin className="mr-1" size={14} /> 地図表示
                      </Button>
                    </div>
                  </div>

                  {/* チームに割り当てられた予約リスト */}
                  <div className="overflow-x-auto">
                    {group.groupReservations && group.groupReservations.length > 0 ? (
                      <>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                順番
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                時間
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                顧客情報
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                住所
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                商品
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {group.groupReservations.map((gr, index) => {
                              const reservation = getReservationById(gr.sbmReservationId)
                              if (!reservation) return null

                              return (
                                <tr key={gr.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium">
                                      {gr.deliveryOrder || index + 1}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {formatDate(reservation.deliveryDate, 'HH:mm')}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{reservation.customerName}</div>
                                    <div className="text-xs text-gray-500">
                                      {formatPhoneNumber(reservation.phoneNumber || '')}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm text-gray-900">
                                      {reservation.prefecture}
                                      {reservation.city}
                                      {reservation.street}
                                    </div>
                                    {reservation.building && <div className="text-xs text-gray-500">{reservation.building}</div>}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm text-gray-900">
                                      {reservation.items?.map((item, idx) => (
                                        <div key={idx} className="text-sm">
                                          {item.productName} x{item.quantity}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                    <Button
                                      onClick={() => openMoveModal(reservation.id, group.id)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      移動
                                    </Button>
                                    <Button
                                      onClick={() => MapModalReturn.handleOpen({reservationId: reservation.id})}
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      地図
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>

                        {/* 配達順路間の所要時間表示 */}
                        <div className="mt-4 p-4 border-t">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">配達順路間の所要時間</h4>
                          {group.groupReservations.length > 1 ? (
                            <TravelTimeCalculator
                              reservations={
                                group.groupReservations
                                  .map(gr => getReservationById(gr.sbmReservationId))
                                  .filter(Boolean) as Reservation[]
                              }
                            />
                          ) : (
                            <p className="text-sm text-gray-500">所要時間を計算するには2件以上の予約が必要です</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-gray-500">このチームに割り当てられた予約はありません</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </R_Stack>
        </R_Stack>

        {/* チーム作成モーダル */}
        <TeamModalReturn.Modal>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">新規チーム作成</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                    チーム名
                  </label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="チーム名を入力"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={TeamModalReturn.handleClose}>
                  キャンセル
                </Button>
                <Button onClick={handleCreateTeam}>作成</Button>
              </div>
            </div>
          </div>
        </TeamModalReturn.Modal>

        {/* 予約移動モーダル */}
        <MoveModalReturn.Modal>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">予約の移動</h3>
              {movingReservation && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{movingReservation.reservation.customerName}</span>{' '}
                      の予約を別のチームに移動します
                    </p>
                  </div>
                  <div>
                    <label htmlFor="targetTeam" className="block text-sm font-medium text-gray-700">
                      移動先チーム
                    </label>
                    <Select onValueChange={value => setTargetGroupId(parseInt(value))}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="チームを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryGroups
                          .filter(group => group.id !== movingReservation.fromGroupId)
                          .map(group => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500">※移動した予約は移動先チームの最後尾に配置されます</p>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={MoveModalReturn.handleClose}>
                  キャンセル
                </Button>
                <Button
                  className={`bg-blue-600 hover:bg-blue-700 text-white`}
                  onClick={handleMoveReservation}
                  disabled={!targetGroupId}
                >
                  移動
                </Button>
              </div>
            </div>
          </div>
        </MoveModalReturn.Modal>

        {/* 地図モーダル */}
        <MapModalReturn.Modal>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">配達ルート</h3>
              {MapModalReturn.open?.groupId ? (
                // チームの配達ルート表示
                <DeliveryRouteMap
                  reservations={
                    deliveryGroups
                      .find(g => g.id === MapModalReturn.open?.groupId)
                      ?.groupReservations?.map(gr => {
                        const reservation = getReservationById(gr.sbmReservationId)
                        return reservation as Reservation
                      })
                      .filter(Boolean) || []
                  }
                  teamId={MapModalReturn.open.groupId}
                  optimizeRoute={false}
                />
              ) : MapModalReturn.open?.reservationId ? (
                // 単一予約の地図表示
                <DeliveryRouteMap reservations={reservations.filter(r => r.id === MapModalReturn.open?.reservationId)} />
              ) : (
                // 全予約の地図表示
                <DeliveryRouteMap reservations={reservations} optimizeRoute={false} />
              )}
              <div className="flex justify-end mt-4">
                <Button onClick={MapModalReturn.handleClose} variant="outline">
                  閉じる
                </Button>
              </div>
            </div>
          </div>
        </MapModalReturn.Modal>
      </div>
    </>
  )
}
