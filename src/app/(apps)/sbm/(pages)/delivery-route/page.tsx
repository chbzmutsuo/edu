'use client'

import React, {useState, useEffect} from 'react'
import {Map, Truck, Clock, Users, CheckCircle, AlertCircle, Navigation} from 'lucide-react'
import {getReservations, getAllTeams} from '../../(builders)/serverActions'
import {Reservation, DeliveryTeam} from '../../types'
import {formatDate, formatTime} from '@cm/class/Days/date-utils/formatters'

export default function DeliveryRoutePage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [teams, setTeams] = useState<DeliveryTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [selectedTeam, setSelectedTeam] = useState('')

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [reservationsData, teamsData] = await Promise.all([
        getReservations({
          startDate: selectedDate,
          endDate: selectedDate,
        }),
        getAllTeams(),
      ])

      // 配達のみフィルタリング
      const deliveryReservations = reservationsData.filter(r => r.pickupLocation === '配達')
      setReservations(deliveryReservations)
      setTeams(teamsData)
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleTeamFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeam(e.target.value)
  }

  // チーム別の配達予約をグループ化
  const teamDeliveries = teams.map(team => {
    // 実際の実装では、配達割当テーブルからデータを取得
    // 現在はダミーの割当を生成
    const teamReservations = reservations.filter((_, index) => index % teams.length === teams.indexOf(team))

    return {
      team,
      reservations: teamReservations,
      totalDistance: Math.round(Math.random() * 50 + 10), // ダミー距離
      estimatedDuration: teamReservations.length * 30 + Math.round(Math.random() * 60), // ダミー時間
    }
  })

  const filteredTeamDeliveries = selectedTeam
    ? teamDeliveries.filter(td => td.team.id!.toString() === selectedTeam)
    : teamDeliveries

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Map className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">配達ルート管理</h1>
          </div>
        </div>

        {/* 注意メッセージ */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>開発中機能:</strong> 配達ルート最適化機能は開発中です。現在は基本的な配達管理のみ表示しています。 Google
                Maps API連携、ルート最適化アルゴリズムは今後実装予定です。
              </p>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">配達日</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">配達チーム</label>
              <select
                value={selectedTeam}
                onChange={handleTeamFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">すべてのチーム</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id?.toString()}>
                    {team.name} - {team.driverName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 配達概要統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Truck className="text-blue-600" size={24} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">総配達件数</p>
                <p className="text-2xl font-semibold text-gray-900">{reservations.length}件</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Users className="text-green-600" size={24} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">アクティブチーム</p>
                <p className="text-2xl font-semibold text-gray-900">{teams.filter(t => t.isActive).length}チーム</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">予想配達時間</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(teamDeliveries.reduce((sum, td) => sum + td.estimatedDuration, 0) / teamDeliveries.length || 0)}分
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <Navigation className="text-purple-600" size={24} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">総距離</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {teamDeliveries.reduce((sum, td) => sum + td.totalDistance, 0)}km
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* チーム別配達一覧 */}
        <div className="space-y-6">
          {filteredTeamDeliveries.map(teamDelivery => (
            <div key={teamDelivery.team.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Truck className="text-blue-600" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{teamDelivery.team.name}</h3>
                      <p className="text-sm text-gray-600">
                        運転手: {teamDelivery.team.driverName} | 車両: {teamDelivery.team.vehicleInfo || '未設定'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      配達件数: <span className="font-semibold">{teamDelivery.reservations.length}件</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      予想時間: <span className="font-semibold">{teamDelivery.estimatedDuration}分</span> | 距離:{' '}
                      <span className="font-semibold">{teamDelivery.totalDistance}km</span>
                    </div>
                  </div>
                </div>
              </div>

              {teamDelivery.reservations.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {teamDelivery.reservations.map((reservation, index) => (
                    <div key={reservation.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-lg font-medium text-gray-900">{reservation.customerName}</h4>
                                <span className="text-sm text-gray-500">({reservation.contactName || '担当者不明'})</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">📍 {reservation.deliveryAddress}</p>
                              <p className="text-sm text-gray-600">
                                📞 {reservation.phoneNumber} | 💰 ¥{reservation.totalAmount?.toLocaleString()} | 📦{' '}
                                {reservation.items?.length || 0}アイテム
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">配達時刻: {formatTime(reservation.deliveryDate!)}</div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                reservation.deliveryCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {reservation.deliveryCompleted ? '配達完了' : '配達予定'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>このチームには配達予定がありません</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTeamDeliveries.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Map className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">選択した条件に該当する配達データがありません</p>
          </div>
        )}

        {/* 未来機能プレビュー */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 今後実装予定の機能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-blue-600" size={16} />
                <span>Google Maps API連携による地図表示</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-blue-600" size={16} />
                <span>最適配達ルート自動計算</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-blue-600" size={16} />
                <span>リアルタイム交通情報対応</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-blue-600" size={16} />
                <span>GPS追跡による配達状況監視</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-blue-600" size={16} />
                <span>配達完了通知の自動送信</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-blue-600" size={16} />
                <span>配達効率レポート生成</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
