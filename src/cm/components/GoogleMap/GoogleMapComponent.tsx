// 'use client'

// import React, {useEffect, useMemo} from 'react'
// import {Navigation, AlertCircle, Loader} from 'lucide-react'
// import useGoogleMaps, {MapLocation, MapRoute, UseGoogleMapsOptions} from '@cm/hooks/useGoogleMaps'
// import '@cm/lib/googleMaps'

// export interface GoogleMapComponentProps extends UseGoogleMapsOptions {
//   // 基本設定
//   width?: string | number
//   height?: string | number
//   className?: string

//   // データ
//   locations?: MapLocation[]
//   routes?: MapRoute[]

//   // 機能フラグ
//   showMarkers?: boolean
//   showRoutes?: boolean
//   enableUserLocation?: boolean

//   // イベントハンドラー
//   onLocationClick?: (location: MapLocation) => void
//   onRouteCalculated?: (route: any) => void

//   // UI設定
//   loadingComponent?: React.ReactNode
//   errorComponent?: React.ReactNode
// }

// export const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
//   // 基本設定
//   width = '100%',
//   height = 400,
//   className = '',

//   // データ
//   locations = [],
//   routes = [],

//   // 機能フラグ
//   showMarkers = true,
//   showRoutes = true,
//   enableUserLocation = false,

//   // イベントハンドラー
//   onLocationClick,
//   onRouteCalculated,

//   // UI設定
//   loadingComponent,
//   errorComponent,

//   // Google Maps設定
//   ...mapOptions
// }) => {
//   const {
//     isLoaded,
//     error,
//     map,
//     mapRef,
//     addMarker,
//     clearMarkers,
//     showRoute,
//     setMapCenter,
//     fitBounds,
//     geocodeAddress,
//     reverseGeocode,
//   } = useGoogleMaps(mapOptions)

//   // ユーザーの現在地を取得
//   const getUserLocation = async () => {
//     if (!enableUserLocation) return

//     if ('geolocation' in navigator) {
//       try {
//         const position = await new Promise<GeolocationPosition>((resolve, reject) => {
//           navigator.geolocation.getCurrentPosition(resolve, reject, {
//             enableHighAccuracy: true,
//             timeout: 10000,
//             maximumAge: 300000,
//           })
//         })

//         const userLocation: MapLocation = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//           title: '現在地',
//           description: 'あなたの現在の位置',
//         }

//         if (map) {
//           const marker = addMarker(userLocation)
//           if (marker) {
//             marker.setIcon({
//               url:
//                 'data:image/svg+xml;charset=UTF-8,' +
//                 encodeURIComponent(`
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#fff" stroke-width="2"/>
//                   <circle cx="12" cy="12" r="3" fill="#fff"/>
//                 </svg>
//               `),
//               scaledSize: new google.maps.Size(24, 24),
//             })
//           }
//           setMapCenter(userLocation)
//         }
//       } catch (err) {
//         console.warn('位置情報の取得に失敗しました:', err)
//       }
//     }
//   }

//   // マーカーを表示
//   useEffect(() => {
//     if (!isLoaded || !map || !showMarkers) return

//     clearMarkers()

//     locations.forEach(location => {
//       const marker = addMarker(location)
//       if (marker && onLocationClick) {
//         marker.addListener('click', () => onLocationClick(location))
//       }
//     })

//     // 複数の場所がある場合は全体が見えるように調整
//     if (locations.length > 1) {
//       fitBounds(locations)
//     } else if (locations.length === 1) {
//       setMapCenter(locations[0], 15)
//     }
//   }, [isLoaded, map, locations, showMarkers, addMarker, clearMarkers, fitBounds, setMapCenter, onLocationClick])

//   // ルートを表示
//   useEffect(() => {
//     if (!isLoaded || !map || !showRoutes || routes.length === 0) return

//     routes.forEach(async route => {
//       try {
//         const result = await showRoute(route)
//         if (result && onRouteCalculated) {
//           onRouteCalculated(result)
//         }
//       } catch (err) {
//         console.error('ルート表示エラー:', err)
//       }
//     })
//   }, [isLoaded, map, routes, showRoutes, showRoute, onRouteCalculated])

//   // ユーザー位置の取得
//   useEffect(() => {
//     if (isLoaded && map && enableUserLocation) {
//       getUserLocation()
//     }
//   }, [isLoaded, map, enableUserLocation])

//   // 統計情報を計算
//   const stats = useMemo(() => {
//     return {
//       totalLocations: locations.length,
//       totalRoutes: routes.length,
//       hasValidLocations: locations.every(loc => loc.lat && loc.lng),
//     }
//   }, [locations, routes])

//   const containerStyle = {
//     width: typeof width === 'number' ? `${width}px` : width,
//     height: typeof height === 'number' ? `${height}px` : height,
//   }

//   // エラー表示
//   if (error) {
//     const ErrorComponent = errorComponent || (
//       <div
//         className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
//         style={containerStyle}
//       >
//         <div className="text-center p-6">
//           <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
//           <h3 className="text-lg font-medium text-red-900 mb-2">地図読み込みエラー</h3>
//           <p className="text-sm text-red-700">{error}</p>
//         </div>
//       </div>
//     )
//     return ErrorComponent
//   }

//   // ローディング表示
//   if (!isLoaded) {
//     const LoadingComponent = loadingComponent || (
//       <div
//         className={`flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg ${className}`}
//         style={containerStyle}
//       >
//         <div className="text-center p-6">
//           <Loader className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
//           <p className="text-sm text-gray-600">地図を読み込んでいます...</p>
//         </div>
//       </div>
//     )
//     return LoadingComponent
//   }

//   return (
//     <div className={`relative ${className}`}>
//       {/* 地図本体 */}
//       <div ref={mapRef} style={containerStyle} className="rounded-lg overflow-hidden border border-gray-200" />

//       {/* 情報パネル（開発時用） */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-lg p-2 text-xs text-gray-600">
//           <div>場所: {stats.totalLocations}件</div>
//           <div>ルート: {stats.totalRoutes}件</div>
//           {!stats.hasValidLocations && <div className="text-red-600">⚠️ 無効な座標あり</div>}
//         </div>
//       )}

//       {/* ユーザー位置取得ボタン */}
//       {enableUserLocation && (
//         <button
//           onClick={getUserLocation}
//           className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-full p-2 shadow-lg transition-colors"
//           title="現在地を表示"
//         >
//           <Navigation size={20} className="text-blue-600" />
//         </button>
//       )}
//     </div>
//   )
// }

// // 便利なラッパーコンポーネント

// // 単一場所表示用
// export const SingleLocationMap: React.FC<{
//   location: MapLocation
//   zoom?: number
//   width?: string | number
//   height?: string | number
//   className?: string
//   onLocationClick?: (location: MapLocation) => void
// }> = ({location, zoom = 15, ...props}) => {
//   return (
//     <GoogleMapComponent
//       locations={[location]}
//       defaultCenter={location}
//       defaultZoom={zoom}
//       showMarkers={true}
//       showRoutes={false}
//       {...props}
//     />
//   )
// }

// // 複数場所表示用
// export const MultiLocationMap: React.FC<{
//   locations: MapLocation[]
//   width?: string | number
//   height?: string | number
//   className?: string
//   onLocationClick?: (location: MapLocation) => void
// }> = ({locations, ...props}) => {
//   return <GoogleMapComponent locations={locations} showMarkers={true} showRoutes={false} {...props} />
// }

// // ルート表示用
// export const RouteMap: React.FC<{
//   route: MapRoute
//   width?: string | number
//   height?: string | number
//   className?: string
//   onRouteCalculated?: (route: google.maps.DirectionsResult) => void
// }> = ({route, ...props}) => {
//   return <GoogleMapComponent routes={[route]} showMarkers={false} showRoutes={true} {...props} />
// }

// export default GoogleMapComponent
