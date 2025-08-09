'use client'

import React, {useState, useEffect} from 'react'
import {Map, CheckCircle} from 'lucide-react'
import {DeliveryGroup, Reservation} from '../../types'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import DeliveryGroupManager from '../../components/DeliveryGroupManager'
import UnassignedDeliveries from '../../components/UnassignedDeliveries'

import DeliveryStats from '../../components/DeliveryStats'
import {getGroupReservations, updateDeliveryGroup, assignReservationsToGroup} from '../../(builders)/deliveryActions'
import {DeliveryRouteGenerator} from '@app/(apps)/sbm/components/DeliveryRouteGenerator'

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
      const reservations = await getGroupReservations(groupId)
      setGroupReservations(reservations as unknown as Reservation[])
    } catch (error) {
      console.error('グループ予約の取得に失敗:', error)
    }
  }

  const handleGroupSelect = (group: DeliveryGroup | null) => {
    setSelectedGroup(group)
  }

  const handleAssignToGroup = async (reservations: Reservation[], groupId: number) => {
    try {
      await assignReservationsToGroup(reservations, groupId)
      alert(`${reservations.length}件の予約をグループに割り当てました`)
      loadGroupReservations(groupId)
    } catch (error) {
      console.error('グループ割り当てに失敗:', error)
      alert('予約の割り当てに失敗しました')
    }
  }

  const handleRouteUpdate = async (updatedGroup: DeliveryGroup) => {
    try {
      const updated = await updateDeliveryGroup(updatedGroup)
      setSelectedGroup(updated as unknown as DeliveryGroup)
    } catch (error) {
      console.error('グループ情報の更新に失敗:', error)
      alert('グループ情報の更新に失敗しました')
    }
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

          <DeliveryStats selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  )
}
