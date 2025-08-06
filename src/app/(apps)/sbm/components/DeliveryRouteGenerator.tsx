'use client'

import React, {useState, useEffect} from 'react'
import {
  Route,
  Navigation,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  GripVertical,
  Save,
} from 'lucide-react'
import {DragDropContext, Droppable, Draggable, DropResult} from 'react-beautiful-dnd'
import {DeliveryGroup, DeliveryRouteStop, Reservation} from '../types'
import {routeOptimizationService, DeliveryStop} from '@cm/lib/googleMaps/routeOptimizationService'
import {geocodingService} from '@cm/lib/googleMaps/geocodingService'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

interface DeliveryRouteGeneratorProps {
  selectedGroup: DeliveryGroup
  groupReservations: Reservation[]
  onRouteUpdate: (group: DeliveryGroup) => void
}

export const DeliveryRouteGenerator: React.FC<DeliveryRouteGeneratorProps> = ({
  selectedGroup,
  groupReservations,
  onRouteUpdate,
}) => {
  const [routeStops, setRouteStops] = useState<DeliveryRouteStop[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedGroup.optimizedRoute) {
      setRouteStops(selectedGroup.optimizedRoute)
    } else {
      // 予約から基本的なルート停止点を作成
      const stops = groupReservations.map((reservation, index) => ({
        id: `stop-${reservation.id}`,
        deliveryGroupId: selectedGroup.id!,
        reservationId: reservation.id!,
        customerName: reservation.customerName!,
        address: `${reservation.prefecture}${reservation.city}${reservation.street}${reservation.building || ''}`,
        estimatedArrival: reservation.deliveryDate,
        deliveryOrder: index + 1,
        deliveryCompleted: reservation.deliveryCompleted || false,
        recoveryCompleted: reservation.recoveryCompleted || false,
        estimatedDuration: 15, // デフォルト15分
      }))
      setRouteStops(stops)
    }
  }, [selectedGroup, groupReservations])

  const generateOptimizedRoute = async () => {
    if (routeStops.length < 2) {
      setError('ルート最適化には2件以上の配達先が必要です')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // ジオコーディング実行
      const geocodedStops: DeliveryStop[] = []

      for (const stop of routeStops) {
        try {
          const result = await geocodingService.geocode(stop.address!)
          if (result.length > 0) {
            const location = result[0]
            geocodedStops.push({
              ...location,
              id: stop.id!,
              customerName: stop.customerName,
              deliveryTime: stop.estimatedArrival ? new Date(stop.estimatedArrival) : undefined,
              priority: getPriority(stop),
              estimatedDuration: stop.estimatedDuration || 15,
            })
          }
        } catch (err) {
          console.warn(`住所のジオコーディングに失敗: ${stop.customerName}`, err)
        }
      }

      if (geocodedStops.length < 2) {
        setError('住所から座標を取得できませんでした。住所情報を確認してください。')
        return
      }

      // ルート最適化実行
      const result = await routeOptimizationService.optimizeRoute(geocodedStops)
      const report = routeOptimizationService.generateEfficiencyReport(result)

      setOptimizationResult({result, report})

      // 最適化されたルートを反映
      const optimizedStops = result.optimizedOrder.map((stop, index) => {
        const originalStop = routeStops.find(s => s.id === stop.id)
        return {
          ...originalStop,
          deliveryOrder: index + 1,
          lat: stop.lat,
          lng: stop.lng,
          estimatedArrival: calculateEstimatedArrival(index, result.optimizedOrder),
        }
      })

      setRouteStops(optimizedStops)

      // グループのルート情報を更新
      const updatedGroup: DeliveryGroup = {
        ...selectedGroup,
        status: 'route_generated',
        optimizedRoute: optimizedStops,
        estimatedDuration: Math.round(result.totalDuration),
        routeUrl: generateGoogleMapsUrl(result.optimizedOrder),
        updatedAt: new Date(),
      }

      onRouteUpdate(updatedGroup)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルート最適化に失敗しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const getPriority = (stop: DeliveryRouteStop): 'high' | 'medium' | 'low' => {
    const reservation = groupReservations.find(r => r.id === stop.reservationId)
    if (reservation?.purpose === 'イベント') return 'high'
    if (reservation?.purpose === '会議') return 'medium'
    return 'low'
  }

  const calculateEstimatedArrival = (index: number, stops: DeliveryStop[]): Date => {
    const baseTime = new Date()
    baseTime.setHours(9, 0, 0, 0) // 9:00から開始

    let totalMinutes = 0
    for (let i = 0; i <= index; i++) {
      totalMinutes += stops[i].estimatedDuration || 15
      if (i > 0) {
        // 移動時間を追加（簡易計算：5分）
        totalMinutes += 5
      }
    }

    const arrivalTime = new Date(baseTime)
    arrivalTime.setMinutes(arrivalTime.getMinutes() + totalMinutes)
    return arrivalTime
  }

  const generateGoogleMapsUrl = (stops: DeliveryStop[]): string => {
    if (stops.length < 2) return ''

    const origin = `${stops[0].lat},${stops[0].lng}`
    const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`
    const waypoints = stops
      .slice(1, -1)
      .map(stop => `${stop.lat},${stop.lng}`)
      .join('|')

    const baseUrl = 'https://www.google.com/maps/dir/'
    const params = new URLSearchParams({
      api: '1',
      origin,
      destination,
      travelmode: 'driving',
    })

    if (waypoints) {
      params.append('waypoints', waypoints)
    }

    return `${baseUrl}?${params.toString()}`
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(routeStops)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // 配達順序を更新
    const reorderedStops = items.map((stop, index) => ({
      ...stop,
      deliveryOrder: index + 1,
    }))

    setRouteStops(reorderedStops)
  }

  const toggleDeliveryStatus = (stopId: string, field: 'deliveryCompleted' | 'recoveryCompleted') => {
    const updatedStops = routeStops.map(stop => (stop.id === stopId ? {...stop, [field]: !stop[field]} : stop))
    setRouteStops(updatedStops)

    // TODO: API呼び出してDBを更新
  }

  const saveRouteChanges = () => {
    const updatedGroup: DeliveryGroup = {
      ...selectedGroup,
      optimizedRoute: routeStops,
      updatedAt: new Date(),
    }
    onRouteUpdate(updatedGroup)
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <Route className="text-green-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">配達ルート作成</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {selectedGroup.name}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {selectedGroup.status === 'planning' && (
            <button
              onClick={generateOptimizedRoute}
              disabled={isGenerating || routeStops.length < 2}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? <RotateCcw className="animate-spin mr-2" size={16} /> : <Navigation size={16} className="mr-2" />}
              {isGenerating ? '最適化中...' : 'ルート最適化'}
            </button>
          )}

          {selectedGroup.routeUrl && (
            <a
              href={selectedGroup.routeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              GoogleMapで表示
            </a>
          )}

          <button
            onClick={saveRouteChanges}
            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition-colors"
          >
            <Save size={16} className="mr-2" />
            保存
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* 最適化結果 */}
      {optimizationResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-3">🎯 ルート最適化完了</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">総距離:</span>
              <div className="text-lg font-bold text-green-700">{optimizationResult.report.details.totalDistance}km</div>
            </div>
            <div>
              <span className="font-medium">所要時間:</span>
              <div className="text-lg font-bold text-green-700">
                {Math.floor(optimizationResult.report.details.totalDuration / 60)}h{' '}
                {optimizationResult.report.details.totalDuration % 60}m
              </div>
            </div>
            <div>
              <span className="font-medium">燃料費:</span>
              <div className="text-lg font-bold text-green-700">
                ¥{optimizationResult.report.details.estimatedFuelCost.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="font-medium">効率:</span>
              <div
                className={`text-lg font-bold ${
                  optimizationResult.report.details.efficiency === 'excellent'
                    ? 'text-green-700'
                    : optimizationResult.report.details.efficiency === 'good'
                      ? 'text-blue-700'
                      : 'text-yellow-700'
                }`}
              >
                {optimizationResult.report.details.efficiency === 'excellent' && '優秀'}
                {optimizationResult.report.details.efficiency === 'good' && '良好'}
                {optimizationResult.report.details.efficiency === 'fair' && '普通'}
                {optimizationResult.report.details.efficiency === 'poor' && '改善要'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 配達ルート */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">配達順序</h3>
          <p className="text-sm text-gray-600 mt-1">
            ドラッグ&ドロップで順序を変更できます。配達・回収の完了状況もここで更新可能です。
          </p>
        </div>

        {routeStops.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">配達先がありません</h3>
            <p className="text-gray-500">このグループに予約を割り当ててください</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="route-stops">
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {routeStops.map((stop, index) => (
                    <Draggable key={stop.id} draggableId={stop.id!} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-6 border-b border-gray-200 ${
                            snapshot.isDragging ? 'bg-blue-50 shadow-lg' : 'hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <div className="flex items-center space-x-4">
                            {/* ドラッグハンドル */}
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="text-gray-400" size={20} />
                            </div>

                            {/* 順序番号 */}
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {stop.deliveryOrder}
                            </div>

                            {/* 配達先情報 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-medium text-gray-900">{stop.customerName}</h4>
                                {stop.estimatedArrival && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Clock size={16} className="mr-1" />
                                    <span>到着予定: {formatDate(stop.estimatedArrival, 'HH:mm')}</span>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <MapPin size={16} />
                                  <span>{stop.address}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock size={16} />
                                  <span>作業時間: {stop.estimatedDuration}分</span>
                                </div>
                              </div>
                            </div>

                            {/* 完了チェック */}
                            <div className="flex items-center space-x-4">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={stop.deliveryCompleted || false}
                                  onChange={() => toggleDeliveryStatus(stop.id!, 'deliveryCompleted')}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">配達完了</span>
                              </label>

                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={stop.recoveryCompleted || false}
                                  onChange={() => toggleDeliveryStatus(stop.id!, 'recoveryCompleted')}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">回収完了</span>
                              </label>

                              {/* 完了ステータス表示 */}
                              {stop.deliveryCompleted && stop.recoveryCompleted && (
                                <CheckCircle className="text-green-600" size={20} />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}

export default DeliveryRouteGenerator
