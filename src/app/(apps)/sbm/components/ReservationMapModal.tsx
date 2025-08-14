'use client'

import React, {useState, useEffect, useMemo} from 'react'
import {Map, MapPin, Navigation, X, Maximize2, Minimize2, Route} from 'lucide-react'
// import {GoogleMapComponent} from '@cm/components/GoogleMap/GoogleMapComponent'
import {MapLocation} from '@cm/hooks/useGoogleMaps'
import {geocodingService} from '@cm/lib/googleMaps/geocodingService'
import {routeOptimizationService, DeliveryStop} from '@cm/lib/googleMaps/routeOptimizationService'
import {Reservation} from '../types'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import '@cm/lib/googleMaps'

interface ReservationMapModalProps {
  reservations: Reservation[]
  isOpen: boolean
  onClose: () => void
  selectedReservation?: Reservation | null
  showOptimizedRoute?: boolean
}

export const ReservationMapModal: React.FC<ReservationMapModalProps> = ({
  reservations,
  isOpen,
  onClose,
  selectedReservation,
  showOptimizedRoute = false,
}) => {
  const [mapMode, setMapMode] = useState<'single' | 'multiple' | 'route'>('single')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locations, setLocations] = useState<MapLocation[]>([])
  const [routeData, setRouteData] = useState<any>(null)

  // 住所から座標を取得
  const geocodeReservations = async (reservationsToGeocode: Reservation[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const validReservations = reservationsToGeocode.filter(r => r.prefecture && r.city && r.street)

      if (validReservations.length === 0) {
        setError('表示可能な住所データがありません')
        return
      }

      const geocodedLocations: MapLocation[] = []

      for (const reservation of validReservations) {
        try {
          const result = await geocodingService.geocodeFromSBMAddress({
            postalCode: reservation.postalCode,
            prefecture: reservation.prefecture,
            city: reservation.city,
            street: reservation.street,
            building: reservation.building,
          })

          if (result) {
            geocodedLocations.push({
              lat: result.lat,
              lng: result.lng,
              title: reservation.customerName || '配達先',
              description: `
                <div>
                  <strong>配達日時:</strong> ${formatDate(reservation.deliveryDate!, 'MM/DD HH:mm')}<br/>
                  <strong>電話番号:</strong> ${reservation.phoneNumber}<br/>
                  <strong>受取方法:</strong> ${reservation.pickupLocation}<br/>
                  <strong>用途:</strong> ${reservation.purpose}<br/>
                  <strong>金額:</strong> ¥${reservation.finalAmount?.toLocaleString()}<br/>
                  ${reservation.notes ? `<strong>備考:</strong> ${reservation.notes}` : ''}
                </div>
              `,
              address: result.addressComponents.fullAddress,
            })
          }
        } catch (err) {
          console.warn(`住所のジオコーディングに失敗: ${reservation.customerName}`, err)
        }
      }

      if (geocodedLocations.length === 0) {
        setError('住所から座標を取得できませんでした')
      } else {
        setLocations(geocodedLocations)
      }
    } catch (err) {
      setError('地図データの取得に失敗しました')
      console.error('Geocoding error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // ルート最適化
  const optimizeDeliveryRoute = async () => {
    if (locations.length < 2) {
      setError('ルート最適化には2件以上の配達先が必要です')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const deliveryStops: DeliveryStop[] = locations.map((location, index) => {
        const reservation = reservations[index]
        return {
          ...location,
          id: reservation.id || index,
          customerName: reservation.customerName,
          deliveryTime: reservation.deliveryDate ? new Date(reservation.deliveryDate) : undefined,
          priority: reservation.purpose === 'イベント' ? ('high' as const) : ('medium' as const),
          estimatedDuration: 10, // 基本的な配達時間: 10分
        }
      })

      const result = await routeOptimizationService.optimizeRoute(deliveryStops)
      const report = routeOptimizationService.generateEfficiencyReport(result)

      setRouteData({
        result,
        report,
        optimizedLocations: result.optimizedOrder,
      })

      setMapMode('route')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ルート最適化に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // モード変更時の処理
  useEffect(() => {
    if (!isOpen) return

    if (selectedReservation && mapMode === 'single') {
      geocodeReservations([selectedReservation])
    } else if (mapMode === 'multiple') {
      geocodeReservations(reservations.slice(0, 10)) // 最大10件まで
    }
  }, [isOpen, mapMode, selectedReservation, reservations])

  // 表示データの計算
  const displayData = useMemo(() => {
    if (mapMode === 'route' && routeData) {
      return {
        locations: routeData.optimizedLocations,
        routes: [
          {
            origin: routeData.optimizedLocations[0],
            destination: routeData.optimizedLocations[routeData.optimizedLocations.length - 1],
            waypoints: routeData.optimizedLocations.slice(1, -1),
          },
        ],
      }
    }

    return {
      locations,
      routes: [],
    }
  }, [mapMode, locations, routeData])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4 ${isFullscreen ? 'p-0' : ''}`}
    >
      <div
        className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl max-h-[90vh]'}`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Map className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              配達先マップ
              {selectedReservation && mapMode === 'single' && ` - ${selectedReservation.customerName}`}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* モード切替 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMapMode('single')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  mapMode === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={!selectedReservation}
              >
                <MapPin size={16} className="inline mr-1" />
                単一
              </button>
              <button
                onClick={() => setMapMode('multiple')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  mapMode === 'multiple' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin size={16} className="inline mr-1" />
                複数
              </button>
              <button
                onClick={() => setMapMode('route')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  mapMode === 'route' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={locations.length < 2}
              >
                <Route size={16} className="inline mr-1" />
                ルート
              </button>
            </div>

            {/* ルート最適化ボタン */}
            {mapMode === 'multiple' && locations.length >= 2 && (
              <button
                onClick={optimizeDeliveryRoute}
                disabled={isLoading}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Navigation size={16} className="inline mr-1" />
                最適化
              </button>
            )}

            {/* フルスクリーンボタン */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>

            {/* 閉じるボタン */}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className={`flex ${isFullscreen ? 'h-full' : 'h-[600px]'}`}>
          {/* 地図 */}
          <div className="flex-1 p-4">
            {error ? (
              <div className="h-full flex items-center justify-center bg-red-50 border border-red-200 rounded-lg">
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-red-400 mb-4" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            ) : (
              <div>Google Map Componentを描画します</div>
              // <GoogleMapComponent
              //   locations={displayData.locations}
              //   routes={displayData.routes}
              //   height="100%"
              //   showMarkers={mapMode !== 'route'}
              //   showRoutes={mapMode === 'route'}
              //   enableUserLocation={true}
              //   defaultCenter={{lat: 35.6762, lng: 139.6503}}
              //   defaultZoom={12}
              //   loadingComponent={
              //     <div className="h-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
              //       <div className="text-center">
              //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              //         <p className="text-gray-600">地図を読み込んでいます...</p>
              //       </div>
              //     </div>
              //   }
              // />
            )}
          </div>

          {/* サイドパネル */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {mapMode === 'single' && '配達先詳細'}
                {mapMode === 'multiple' && '配達先一覧'}
                {mapMode === 'route' && 'ルート情報'}
              </h3>

              {/* ルート情報表示 */}
              {mapMode === 'route' && routeData && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-900 mb-2">最適化結果</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>配達先数:</span>
                        <span>{routeData.report.details.totalStops}件</span>
                      </div>
                      <div className="flex justify-between">
                        <span>総距離:</span>
                        <span>{routeData.report.details.totalDistance}km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>所要時間:</span>
                        <span>
                          {Math.floor(routeData.report.details.totalDuration / 60)}h {routeData.report.details.totalDuration % 60}
                          m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>燃料費:</span>
                        <span>¥{routeData.report.details.estimatedFuelCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>効率:</span>
                        <span
                          className={`font-medium ${
                            routeData.report.details.efficiency === 'excellent'
                              ? 'text-green-600'
                              : routeData.report.details.efficiency === 'good'
                                ? 'text-blue-600'
                                : routeData.report.details.efficiency === 'fair'
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                          }`}
                        >
                          {routeData.report.details.efficiency === 'excellent' && '優秀'}
                          {routeData.report.details.efficiency === 'good' && '良好'}
                          {routeData.report.details.efficiency === 'fair' && '普通'}
                          {routeData.report.details.efficiency === 'poor' && '改善要'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {routeData.report.recommendations.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">改善提案</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {routeData.report.recommendations.map((rec: string, index: number) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 配達先リスト */}
              <div className="space-y-2 mt-4">
                {displayData.locations.map((location, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border hover:border-blue-300 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{location.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{location.address}</p>
                        {mapMode === 'route' && index > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            前の地点から:{' '}
                            {geocodingService.calculateDistance(displayData.locations[index - 1], location).toFixed(1)}km
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationMapModal
