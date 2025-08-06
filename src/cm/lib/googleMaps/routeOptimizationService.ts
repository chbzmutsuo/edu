'use client'

import {MapLocation} from '@cm/hooks/useGoogleMaps'
import {geocodingService} from './geocodingService'
import './index'

export interface OptimizationResult {
  optimizedOrder: DeliveryStop[]
  totalDistance: number
  totalDuration: number
  estimatedFuelCost: number
  route: google.maps.DirectionsResult | null
}

export interface DeliveryStop extends MapLocation {
  id: string | number
  customerName?: string
  deliveryTime?: Date
  priority?: 'high' | 'medium' | 'low'
  timeWindow?: {
    start: Date
    end: Date
  }
  estimatedDuration?: number // 配達にかかる時間（分）
  address?: string
  notes?: string
}

export interface OptimizationOptions {
  startLocation?: MapLocation
  endLocation?: MapLocation
  maxStops?: number
  considerTraffic?: boolean
  prioritizeTimeWindows?: boolean
  fuelCostPerKm?: number
  departureTime?: Date
}

class RouteOptimizationService {
  private readonly defaultOptions: OptimizationOptions = {
    maxStops: 25, // Google Maps APIの制限
    considerTraffic: true,
    prioritizeTimeWindows: true,
    fuelCostPerKm: 15, // 円/km（概算）
  }

  constructor(private options: OptimizationOptions = {}) {
    this.options = {...this.defaultOptions, ...options}
  }

  // メインの最適化関数
  async optimizeRoute(stops: DeliveryStop[]): Promise<OptimizationResult> {
    if (stops.length === 0) {
      throw new Error('配達先が指定されていません')
    }

    if (stops.length > (this.options.maxStops || 25)) {
      throw new Error(`配達先が多すぎます。最大${this.options.maxStops}件まで対応可能です`)
    }

    try {
      // 1. 基本的な最適化（距離ベース）
      let optimizedStops = await this.optimizeByDistance(stops)

      // 2. 時間窓制約を考慮した最適化
      if (this.options.prioritizeTimeWindows) {
        optimizedStops = this.optimizeByTimeWindows(optimizedStops)
      }

      // 3. 優先度を考慮した調整
      optimizedStops = this.adjustByPriority(optimizedStops)

      // 4. Google Maps Directions API でルート計算
      const route = await this.calculateRoute(optimizedStops)

      // 5. コスト計算
      const totalDistance = this.calculateTotalDistance(optimizedStops)
      const totalDuration = route ? this.extractTotalDuration(route) : 0
      const estimatedFuelCost = totalDistance * (this.options.fuelCostPerKm || 15)

      return {
        optimizedOrder: optimizedStops,
        totalDistance,
        totalDuration,
        estimatedFuelCost,
        route,
      }
    } catch (error) {
      throw new Error(`ルート最適化に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    }
  }

  // 距離ベースの最適化（最近隣法の改良版）
  private async optimizeByDistance(stops: DeliveryStop[]): Promise<DeliveryStop[]> {
    if (stops.length <= 2) return stops

    const optimized: DeliveryStop[] = []
    const remaining = [...stops]

    // 開始地点の決定
    let current = this.options.startLocation || stops[0]
    if (this.options.startLocation) {
      // 開始地点から最も近い配達先を最初に選択
      const nearestIndex = this.findNearestStopIndex(remaining, current)
      optimized.push(remaining.splice(nearestIndex, 1)[0])
      current = optimized[0]
    } else {
      optimized.push(remaining.shift()!)
      current = optimized[0]
    }

    // 最近隣法で順次追加
    while (remaining.length > 0) {
      const nearestIndex = this.findNearestStopIndex(remaining, current)
      const nearestStop = remaining.splice(nearestIndex, 1)[0]
      optimized.push(nearestStop)
      current = nearestStop
    }

    // 2-opt法で局所改良
    return this.apply2OptImprovement(optimized)
  }

  // 時間窓制約を考慮した最適化
  private optimizeByTimeWindows(stops: DeliveryStop[]): DeliveryStop[] {
    if (!stops.some(stop => stop.timeWindow)) return stops

    // 時間窓の開始時刻でソート
    const withTimeWindows = stops.filter(stop => stop.timeWindow)
    const withoutTimeWindows = stops.filter(stop => !stop.timeWindow)

    withTimeWindows.sort((a, b) => {
      if (!a.timeWindow || !b.timeWindow) return 0
      return a.timeWindow.start.getTime() - b.timeWindow.start.getTime()
    })

    // 時間窓がある配達先を優先し、その間に時間窓がない配達先を挿入
    const result: DeliveryStop[] = []
    let currentTime = this.options.departureTime || new Date()

    for (const stop of withTimeWindows) {
      if (stop.timeWindow) {
        // 時間窓開始前に配達できる地点を挿入
        const availableTime = stop.timeWindow.start.getTime() - currentTime.getTime()
        const insertableStops = this.findInsertableStops(
          withoutTimeWindows,
          availableTime,
          result[result.length - 1] || null,
          stop
        )

        result.push(...insertableStops)
        result.push(stop)

        // 時間を更新
        currentTime = new Date(
          Math.max(currentTime.getTime(), stop.timeWindow.start.getTime()) + (stop.estimatedDuration || 10) * 60000
        )
      }
    }

    // 残りの配達先を追加
    const remainingStops = withoutTimeWindows.filter(stop => !result.includes(stop))
    result.push(...remainingStops)

    return result
  }

  // 優先度による調整
  private adjustByPriority(stops: DeliveryStop[]): DeliveryStop[] {
    const priorityOrder = {high: 0, medium: 1, low: 2}

    // 高優先度の配達先を前方に移動（ただし距離も考慮）
    const result = [...stops]

    for (let i = 0; i < result.length; i++) {
      const currentStop = result[i]
      if (currentStop.priority === 'high') {
        // 可能な限り前方に移動（但し距離の増加が許容範囲内の場合のみ）
        for (let j = Math.max(0, i - 3); j < i; j++) {
          const swapCost = this.calculateSwapCost(result, i, j)
          if (swapCost < 5) {
            // 5km以内の増加なら許容
            const temp = result[i]
            result[i] = result[j]
            result[j] = temp
            i = j // インデックスを調整
            break
          }
        }
      }
    }

    return result
  }

  // Google Maps APIでルート計算
  private async calculateRoute(stops: DeliveryStop[]): Promise<google.maps.DirectionsResult | null> {
    if (!window.google?.maps || stops.length < 2) return null

    try {
      const directionsService = new google.maps.DirectionsService()

      const origin = this.options.startLocation || stops[0]
      const destination = this.options.endLocation || stops[stops.length - 1]
      const waypoints = stops.slice(1, -1).map(stop => ({
        location: {lat: stop.lat, lng: stop.lng},
        stopover: true,
      }))

      const request: google.maps.DirectionsRequest = {
        origin: {lat: origin.lat, lng: origin.lng},
        destination: {lat: destination.lat, lng: destination.lng},
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: this.options.considerTraffic
          ? {
              departureTime: this.options.departureTime || new Date(),
              trafficModel: google.maps.TrafficModel.BEST_GUESS,
            }
          : undefined,
        avoidHighways: false,
        avoidTolls: false,
        region: 'JP',
      }

      return new Promise((resolve, reject) => {
        directionsService.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result)
          } else {
            console.warn(`ルート計算エラー: ${status}`)
            resolve(null)
          }
        })
      })
    } catch (error) {
      console.error('ルート計算に失敗:', error)
      return null
    }
  }

  // 最近隣の配達先を見つける
  private findNearestStopIndex(stops: DeliveryStop[], current: MapLocation): number {
    let minDistance = Infinity
    let nearestIndex = 0

    stops.forEach((stop, index) => {
      const distance = geocodingService.calculateDistance(current, stop)
      if (distance < minDistance) {
        minDistance = distance
        nearestIndex = index
      }
    })

    return nearestIndex
  }

  // 2-opt法による局所改良
  private apply2OptImprovement(stops: DeliveryStop[]): DeliveryStop[] {
    if (stops.length < 4) return stops

    let improved = true
    let result = [...stops]

    while (improved) {
      improved = false

      for (let i = 1; i < result.length - 2; i++) {
        for (let j = i + 1; j < result.length - 1; j++) {
          if (j - i === 1) continue // 隣接する要素はスキップ

          const currentDistance =
            geocodingService.calculateDistance(result[i - 1], result[i]) +
            geocodingService.calculateDistance(result[j], result[j + 1])

          const newDistance =
            geocodingService.calculateDistance(result[i - 1], result[j]) +
            geocodingService.calculateDistance(result[i], result[j + 1])

          if (newDistance < currentDistance) {
            // ルートを改良
            result = [...result.slice(0, i), ...result.slice(i, j + 1).reverse(), ...result.slice(j + 1)]
            improved = true
          }
        }
      }
    }

    return result
  }

  // 時間窓内に挿入可能な配達先を見つける
  private findInsertableStops(
    availableStops: DeliveryStop[],
    availableTimeMs: number,
    fromStop: DeliveryStop | null,
    toStop: DeliveryStop
  ): DeliveryStop[] {
    const insertable: DeliveryStop[] = []
    const availableTimeMinutes = availableTimeMs / 60000

    for (const stop of availableStops) {
      const estimatedDuration = stop.estimatedDuration || 10
      const travelTime = fromStop ? this.estimateTravelTime(fromStop, stop) + this.estimateTravelTime(stop, toStop) : 0

      if (estimatedDuration + travelTime <= availableTimeMinutes) {
        insertable.push(stop)
      }
    }

    return insertable
  }

  // 移動時間の推定（簡易版）
  private estimateTravelTime(from: MapLocation, to: MapLocation): number {
    const distance = geocodingService.calculateDistance(from, to)
    const averageSpeed = 30 // km/h（都市部の平均速度）
    return (distance / averageSpeed) * 60 // 分単位
  }

  // スワップコストの計算
  private calculateSwapCost(stops: DeliveryStop[], index1: number, index2: number): number {
    if (index1 === index2) return 0

    const originalDistance = this.calculateTotalDistance(stops)

    const swapped = [...stops]
    const temp = swapped[index1]
    swapped[index1] = swapped[index2]
    swapped[index2] = temp

    const swappedDistance = this.calculateTotalDistance(swapped)

    return swappedDistance - originalDistance
  }

  // 総距離の計算
  private calculateTotalDistance(stops: DeliveryStop[]): number {
    if (stops.length < 2) return 0

    let totalDistance = 0
    const startLocation = this.options.startLocation || stops[0]

    // 開始地点から最初の配達先
    if (this.options.startLocation) {
      totalDistance += geocodingService.calculateDistance(startLocation, stops[0])
    }

    // 配達先間の距離
    for (let i = 0; i < stops.length - 1; i++) {
      totalDistance += geocodingService.calculateDistance(stops[i], stops[i + 1])
    }

    // 最後の配達先から終了地点
    if (this.options.endLocation) {
      const lastStop = stops[stops.length - 1]
      totalDistance += geocodingService.calculateDistance(lastStop, this.options.endLocation)
    }

    return totalDistance
  }

  // Google Maps結果から総所要時間を抽出
  private extractTotalDuration(result: google.maps.DirectionsResult): number {
    let totalSeconds = 0

    result.routes[0].legs.forEach(leg => {
      if (leg.duration) {
        totalSeconds += leg.duration.value
      }
    })

    return Math.round(totalSeconds / 60) // 分単位で返す
  }

  // 配達効率レポートの生成
  generateEfficiencyReport(result: OptimizationResult): {
    summary: string
    details: {
      totalStops: number
      totalDistance: number
      totalDuration: number
      averageDistancePerStop: number
      estimatedFuelCost: number
      efficiency: 'excellent' | 'good' | 'fair' | 'poor'
    }
    recommendations: string[]
  } {
    const totalStops = result.optimizedOrder.length
    const averageDistancePerStop = totalStops > 0 ? result.totalDistance / totalStops : 0

    let efficiency: 'excellent' | 'good' | 'fair' | 'poor' = 'poor'
    if (averageDistancePerStop < 2) efficiency = 'excellent'
    else if (averageDistancePerStop < 5) efficiency = 'good'
    else if (averageDistancePerStop < 10) efficiency = 'fair'

    const recommendations: string[] = []

    if (efficiency === 'poor') {
      recommendations.push('配達先をエリア別にグループ化することを検討してください')
    }

    if (result.totalDuration > 480) {
      // 8時間以上
      recommendations.push('配達時間が長すぎます。複数の配達員での分担を検討してください')
    }

    if (result.estimatedFuelCost > 5000) {
      recommendations.push('燃料コストが高くなっています。ルートの見直しを検討してください')
    }

    return {
      summary: `${totalStops}件の配達先を最適化しました。総距離: ${result.totalDistance.toFixed(1)}km、所要時間: ${Math.round(result.totalDuration / 60)}時間${result.totalDuration % 60}分`,
      details: {
        totalStops,
        totalDistance: Math.round(result.totalDistance * 10) / 10,
        totalDuration: result.totalDuration,
        averageDistancePerStop: Math.round(averageDistancePerStop * 10) / 10,
        estimatedFuelCost: Math.round(result.estimatedFuelCost),
        efficiency,
      },
      recommendations,
    }
  }
}

// シングルトンインスタンス
export const routeOptimizationService = new RouteOptimizationService()

export default RouteOptimizationService
