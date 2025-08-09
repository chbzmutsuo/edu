'use server'

import {DeliveryRouteStop} from '../types'

interface GeocodingResult {
  lat: number
  lng: number
  formattedAddress: string
  placeId?: string
}

interface DirectionsResult {
  routes: Array<{
    legs: Array<{
      distance: {value: number}
      duration: {value: number}
      startLocation: {lat: number; lng: number}
      endLocation: {lat: number; lng: number}
      steps: Array<{
        distance: {value: number}
        duration: {value: number}
        startLocation: {lat: number; lng: number}
        endLocation: {lat: number; lng: number}
      }>
    }>
    waypoint_order: number[]
  }>
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) throw new Error('Google Maps API key is not configured')

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}&region=JP&language=ja`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK') {
    throw new Error(`Geocoding failed: ${data.status}`)
  }

  const result = data.results[0]
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
  }
}

export async function optimizeRoute(stops: DeliveryRouteStop[]): Promise<DeliveryRouteStop[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) throw new Error('Google Maps API key is not configured')

  // 全ての住所をジオコーディング
  const geocodedStops = await Promise.all(
    stops.map(async stop => {
      if (!stop.lat || !stop.lng) {
        const geocoded = await geocodeAddress(stop.address!)
        return {...stop, lat: geocoded.lat, lng: geocoded.lng}
      }
      return stop
    })
  )

  // Google Directions APIを使用してルートを最適化
  const origin = geocodedStops[0]
  const destination = geocodedStops[geocodedStops.length - 1]
  const waypoints = geocodedStops.slice(1, -1)

  const waypointStr = waypoints.map(stop => `${stop.lat},${stop.lng}`).join('|')

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${
    origin.lng
  }&destination=${destination.lat},${destination.lng}&waypoints=optimize:true|${waypointStr}&key=${apiKey}&language=ja&region=JP`

  const response = await fetch(url)
  const data: DirectionsResult = await response.json()

  if (data.status !== 'OK') {
    throw new Error(`Directions API failed: ${data.status}`)
  }

  // 最適化されたルート順序を取得
  const waypointOrder = data.routes[0].waypoint_order
  const optimizedStops = [origin, ...waypointOrder.map((index: number) => waypoints[index]), destination]

  // 到着時刻と所要時間を計算
  let currentTime = new Date(optimizedStops[0].estimatedArrival!)
  return optimizedStops.map((stop, index) => {
    const leg = data.routes[0].legs[index]
    if (leg) {
      currentTime = new Date(currentTime.getTime() + leg.duration.value * 1000)
      return {
        ...stop,
        deliveryOrder: index + 1,
        estimatedArrival: currentTime,
        estimatedDuration: Math.ceil(leg.duration.value / 60), // 分単位に変換
      }
    }
    return stop
  })
}

// generateGoogleMapsUrlをクライアントサイドのユーティリティ関数として分離
export function generateGoogleMapsUrl(stops: DeliveryRouteStop[]): string {
  'use client' // クライアントサイドでのみ実行されることを明示

  if (stops.length < 2) return ''

  const origin = `${stops[0].lat},${stops[0].lng}`
  const destination = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`
  const waypoints = stops
    .slice(1, -1)
    .map(stop => `${stop.lat},${stop.lng}`)
    .join('|')

  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    waypoints,
    travelmode: 'driving',
  })

  return `https://www.google.com/maps/dir/?${params.toString()}`
}