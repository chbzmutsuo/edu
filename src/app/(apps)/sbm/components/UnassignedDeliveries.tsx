'use client'

import React, {useState, useEffect} from 'react'
import {AlertTriangle, Clock, MapPin, Package, Plus, Search} from 'lucide-react'
import {Reservation, DeliveryGroup} from '../types'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

interface UnassignedDeliveriesProps {
  selectedDate: Date
  selectedGroup: DeliveryGroup | null
  onAssignToGroup: (reservations: Reservation[], groupId: number) => void
}

export const UnassignedDeliveries: React.FC<UnassignedDeliveriesProps> = ({selectedDate, selectedGroup, onAssignToGroup}) => {
  const [unassignedReservations, setUnassignedReservations] = useState<Reservation[]>([])
  const [selectedReservations, setSelectedReservations] = useState<Set<number>>(new Set())
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadUnassignedReservations()
  }, [selectedDate])

  const loadUnassignedReservations = async () => {
    setIsLoading(true)
    try {
      // TODO: API実装後に差し替え
      const mockReservations: Reservation[] = [
        {
          id: 1,
          customerName: 'ABC株式会社',
          contactName: '山田太郎',
          phoneNumber: '03-1234-5678',
          prefecture: '東京都',
          city: '千代田区',
          street: '丸の内1-1-1',
          building: 'ビル5F',
          deliveryDate: new Date(selectedDate.getTime() + 10 * 60 * 60 * 1000), // 10:00
          pickupLocation: '配達',
          purpose: '会議',
          finalAmount: 8500,
          deliveryCompleted: false,
          recoveryCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          customerName: 'XYZ商事',
          contactName: '佐藤花子',
          phoneNumber: '03-2345-6789',
          prefecture: '東京都',
          city: '新宿区',
          street: '西新宿2-2-2',
          building: '',
          deliveryDate: new Date(selectedDate.getTime() + 12 * 60 * 60 * 1000), // 12:00
          pickupLocation: '配達',
          purpose: '研修',
          finalAmount: 12000,
          deliveryCompleted: false,
          recoveryCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          customerName: '株式会社テスト',
          contactName: '田中一郎',
          phoneNumber: '03-3456-7890',
          prefecture: '東京都',
          city: '渋谷区',
          street: '渋谷1-1-1',
          building: '渋谷ビル3F',
          deliveryDate: new Date(selectedDate.getTime() + 14 * 60 * 60 * 1000), // 14:00
          pickupLocation: '配達',
          purpose: 'イベント',
          finalAmount: 15000,
          deliveryCompleted: false,
          recoveryCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      setUnassignedReservations(mockReservations)
    } catch (error) {
      console.error('未割り当て配達の取得に失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredReservations = unassignedReservations.filter(reservation => {
    const keyword = searchKeyword.toLowerCase()
    return (
      reservation.customerName?.toLowerCase().includes(keyword) ||
      reservation.contactName?.toLowerCase().includes(keyword) ||
      reservation.phoneNumber?.includes(keyword) ||
      `${reservation.prefecture}${reservation.city}${reservation.street}`.toLowerCase().includes(keyword)
    )
  })

  const toggleReservationSelection = (reservationId: number) => {
    const newSelected = new Set(selectedReservations)
    if (newSelected.has(reservationId)) {
      newSelected.delete(reservationId)
    } else {
      newSelected.add(reservationId)
    }
    setSelectedReservations(newSelected)
  }

  const toggleAllSelection = () => {
    if (selectedReservations.size === filteredReservations.length) {
      setSelectedReservations(new Set())
    } else {
      setSelectedReservations(new Set(filteredReservations.map(r => r.id!)))
    }
  }

  const handleAssignToGroup = () => {
    if (!selectedGroup || selectedReservations.size === 0) {
      alert('配達グループを選択し、割り当てる予約を選択してください')
      return
    }

    const reservationsToAssign = filteredReservations.filter(r => selectedReservations.has(r.id!))
    onAssignToGroup(reservationsToAssign, selectedGroup.id!)
    setSelectedReservations(new Set())
  }

  const getFullAddress = (reservation: Reservation) => {
    return `${reservation.prefecture}${reservation.city}${reservation.street}${reservation.building || ''}`
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <AlertTriangle className="text-orange-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">グループ未設定の配達</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {filteredReservations.length}件
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="顧客名、住所で検索..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          {/* グループに割り当てボタン */}
          {selectedGroup && (
            <button
              onClick={handleAssignToGroup}
              disabled={selectedReservations.size === 0}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={16} className="mr-2" />
              {selectedGroup.name}に割り当て ({selectedReservations.size})
            </button>
          )}
        </div>
      </div>

      {/* 配達一覧 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchKeyword ? '該当する配達がありません' : 'グループ未設定の配達はありません'}
            </h3>
            <p className="text-gray-500">
              {searchKeyword
                ? '検索条件を変更してお試しください'
                : `${formatDate(selectedDate, 'YYYY年MM月DD日')} の配達はすべて配達グループに割り当て済みです`}
            </p>
          </div>
        ) : (
          <>
            {/* 全選択ヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedReservations.size === filteredReservations.length && filteredReservations.length > 0}
                    onChange={toggleAllSelection}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">すべて選択 ({filteredReservations.length}件)</span>
                </label>
                {selectedReservations.size > 0 && (
                  <span className="text-sm text-blue-600 font-medium">{selectedReservations.size}件 選択中</span>
                )}
              </div>
            </div>

            {/* 配達リスト */}
            <div className="divide-y divide-gray-200">
              {filteredReservations.map(reservation => (
                <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedReservations.has(reservation.id!)}
                      onChange={() => toggleReservationSelection(reservation.id!)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{reservation.customerName}</h3>
                        <span className="text-lg font-semibold text-green-600">¥{reservation.finalAmount?.toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock size={16} />
                            <span>配達時間: {formatDate(reservation.deliveryDate!, 'HH:mm')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin size={16} />
                            <span>{getFullAddress(reservation)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">担当者:</span> {reservation.contactName}
                          </div>
                          <div>
                            <span className="font-medium">電話:</span> {reservation.phoneNumber}
                          </div>
                          <div>
                            <span className="font-medium">用途:</span> {reservation.purpose}
                          </div>
                        </div>
                      </div>

                      {reservation.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <span className="font-medium text-yellow-800">備考:</span>
                          <span className="text-yellow-700 ml-1">{reservation.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 選択中アクション */}
      {selectedReservations.size > 0 && !selectedGroup && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-blue-600" size={20} />
            <p className="text-blue-800">
              {selectedReservations.size}件の配達を選択中です。配達グループを選択してから割り当てボタンを押してください。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnassignedDeliveries
