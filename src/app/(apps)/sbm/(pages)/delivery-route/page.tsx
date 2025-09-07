'use client'

import React, {useState, useEffect} from 'react'
import { Truck, Calendar} from 'lucide-react'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {getReservations} from '../../(builders)/serverActions'
import {Reservation, DeliveryGroup} from '../../types'
import {useIsMobile} from '@cm/shadcn/hooks/use-mobile'
import useModal from '@cm/components/utils/modal/useModal'
import {formatPhoneNumber} from '../../utils/phoneUtils'
import DeliveryRouteMap from '../../components/DeliveryRouteMap'
import { R_Stack} from '@cm/components/styles/common-components/common-components'

export default function DeliveryRoutePage() {
  const [date, setDate] = useState(formatDate(new Date()))
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [deliveryGroups, setDeliveryGroups] = useState<DeliveryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showTeamCreation, setShowTeamCreation] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedReservations, setSelectedReservations] = useState<number[]>([])

  const MapModalReturn = useModal()
  const isMobile = useIsMobile()

  useEffect(() => {
    loadReservations()
  }, [date])

  const loadReservations = async () => {
    setLoading(true)
    try {
      const data = await getReservations({
        startDate: date,
        endDate: date,
      })
      setReservations(data as Reservation[])

      // 仮のチームデータ（実際にはデータベースから取得）
      setDeliveryGroups([
        {
          id: 1,
          name: 'Aチーム',
          deliveryDate: new Date(date),
          userId: 1,
          userName: '山田太郎',
          status: 'planning',
          totalReservations: 3,
          completedReservations: 0,
        },
        {
          id: 2,
          name: 'Bチーム',
          deliveryDate: new Date(date),
          userId: 2,
          userName: '鈴木一郎',
          status: 'route_generated',
          totalReservations: 4,
          completedReservations: 2,
        },
      ])
    } catch (error) {
      console.error('予約データの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = () => {
    if (!teamName || !selectedStaff || selectedReservations.length === 0) {
      alert('チーム名、担当者、予約を選択してください')
      return
    }

    // チーム作成処理（実際にはサーバーアクション）
    const newTeam: DeliveryGroup = {
      id: Math.floor(Math.random() * 1000),
      name: teamName,
      deliveryDate: new Date(date),
      userId: 999, // 仮のID
      userName: selectedStaff,
      status: 'planning',
      totalReservations: selectedReservations.length,
      completedReservations: 0,
    }

    setDeliveryGroups([...deliveryGroups, newTeam])
    setTeamName('')
    setSelectedStaff('')
    setSelectedReservations([])
    setShowTeamCreation(false)
  }

  const toggleReservationSelection = (id: number) => {
    setSelectedReservations(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planning':
        return '計画中'
      case 'route_generated':
        return 'ルート生成済'
      case 'in_progress':
        return '配達中'
      case 'completed':
        return '完了'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'route_generated':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
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
        </div>
      </div>

      {/* 配達チームリスト */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <R_Stack className={` items-stretch gap-8`}>
          <section>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Truck className="mr-2" size={20} />
                配達チーム
              </h2>
            </div>
          </section>

          {/* 未割り当ての予約リスト */}
          <section>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="mr-2" size={20} />
                  未割り当ての予約 ({reservations.length}件)
                </h2>
              </div>

              <div className="overflow-x-auto">
                {reservations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">この日の予約はありません</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          顧客情報
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住所</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservations.map(reservation => (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(reservation.deliveryDate, 'HH:mm')}
                            </div>
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
                            <button
                              onClick={() => MapModalReturn.handleOpen({reservationId: reservation.id})}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              地図表示
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        </R_Stack>
      </div>

      {/* 地図モーダル */}
      <MapModalReturn.Modal>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">配達ルート</h3>
            {MapModalReturn.open?.groupId ? (
              // チームの配達ルート表示
              <DeliveryRouteMap
                reservations={reservations.filter(r => r.id === 1 || r.id === 2)} // 仮実装：実際にはチームに割り当てられた予約をフィルタリング
                teamId={MapModalReturn.open.groupId}
                optimizeRoute={true}
              />
            ) : MapModalReturn.open?.reservationId ? (
              // 単一予約の地図表示
              <DeliveryRouteMap reservations={reservations.filter(r => r.id === MapModalReturn.open?.reservationId)} />
            ) : (
              // 全予約の地図表示
              <DeliveryRouteMap reservations={reservations} optimizeRoute={false} />
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={MapModalReturn.handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </MapModalReturn.Modal>
    </div>
  )
}
