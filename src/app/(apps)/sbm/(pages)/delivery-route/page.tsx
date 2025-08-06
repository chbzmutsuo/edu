'use client'

import React, {useState, useEffect} from 'react'
import {Map, CheckCircle} from 'lucide-react'
import {DeliveryGroup, Reservation} from '../../types'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import DeliveryGroupManager from '../../components/DeliveryGroupManager'
import UnassignedDeliveries from '../../components/UnassignedDeliveries'
import DeliveryRouteGenerator from '../../components/DeliveryRouteGenerator'

export default function DeliveryRoutePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedGroup, setSelectedGroup] = useState<DeliveryGroup | null>(null)
  const [groupReservations, setGroupReservations] = useState<Reservation[]>([])

  // 選択されたグループの予約を取得
  useEffect(() => {
    if (selectedGroup) {
      loadGroupReservations(selectedGroup.id!)
    } else {
      setGroupReservations([])
    }
  }, [selectedGroup])

  const loadGroupReservations = async (groupId: number) => {
    try {
      // TODO: API実装後に差し替え
      const mockReservations: Reservation[] = [
        {
          id: 4,
          customerName: 'グループ配達先A',
          contactName: '担当者A',
          phoneNumber: '03-1111-1111',
          prefecture: '東京都',
          city: '千代田区',
          street: '丸の内1-2-3',
          building: 'ビルA',
          deliveryDate: new Date(selectedDate.getTime() + 10 * 60 * 60 * 1000),
          pickupLocation: '配達',
          purpose: '会議',
          finalAmount: 10000,
          deliveryCompleted: false,
          recoveryCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          customerName: 'グループ配達先B',
          contactName: '担当者B',
          phoneNumber: '03-2222-2222',
          prefecture: '東京都',
          city: '新宿区',
          street: '西新宿3-4-5',
          building: 'ビルB',
          deliveryDate: new Date(selectedDate.getTime() + 13 * 60 * 60 * 1000),
          pickupLocation: '配達',
          purpose: '研修',
          finalAmount: 15000,
          deliveryCompleted: false,
          recoveryCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      setGroupReservations(mockReservations)
    } catch (error) {
      console.error('グループ予約の取得に失敗:', error)
    }
  }

  const handleGroupSelect = (group: DeliveryGroup | null) => {
    setSelectedGroup(group)
  }

  const handleAssignToGroup = async (reservations: Reservation[], groupId: number) => {
    try {
      // TODO: API実装
      console.log('予約をグループに割り当て:', {reservations, groupId})
      alert(`${reservations.length}件の予約をグループに割り当てました`)
    } catch (error) {
      console.error('グループ割り当てに失敗:', error)
    }
  }

  const handleRouteUpdate = (updatedGroup: DeliveryGroup) => {
    setSelectedGroup(updatedGroup)
    // TODO: API呼び出してグループ情報を更新
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Map className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">配達ルート管理</h1>
          </div>
        </div>

        {/* 機能説明 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>配達ルート最適化機能が利用可能です！</strong> Google Maps
                API連携により、効率的な配達ルートの自動計算、リアルタイム地図表示、交通情報を考慮したルート最適化が可能です。
              </p>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 左側: グループ管理 */}
          <div className="space-y-8">
            {/* 配達グループ管理 */}
            <DeliveryGroupManager
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onGroupSelect={handleGroupSelect}
              selectedGroup={selectedGroup}
            />

            {/* グループ未設定の配達 */}
            <UnassignedDeliveries
              selectedDate={selectedDate}
              selectedGroup={selectedGroup}
              onAssignToGroup={handleAssignToGroup}
            />
          </div>

          {/* 右側: ルート作成 */}
          <div>
            {selectedGroup ? (
              <DeliveryRouteGenerator
                selectedGroup={selectedGroup}
                groupReservations={groupReservations}
                onRouteUpdate={handleRouteUpdate}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Map className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">配達グループを選択してください</h3>
                <p className="text-gray-600 mb-6">左側から配達グループを選択すると、ルート最適化機能をご利用いただけます。</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 使用方法</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>配達グループを作成または選択</li>
                    <li>グループ未設定の配達から予約を割り当て</li>
                    <li>ルート最適化ボタンでGoogle Maps APIによる最適ルートを生成</li>
                    <li>手動でルート順序を調整可能</li>
                    <li>GoogleMapリンクで実際のルートを確認</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 統計情報 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{formatDate(selectedDate, 'YYYY年MM月DD日')} の配達状況</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">配達グループ数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">未割り当て配達</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">完了済み配達</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">総配達距離 (km)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
