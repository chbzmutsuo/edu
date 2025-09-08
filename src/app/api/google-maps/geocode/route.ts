import {NextRequest, NextResponse} from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {address} = body

    if (!address) {
      return NextResponse.json({error: '住所が必要です'}, {status: 400})
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({error: 'Google Maps APIキーが設定されていません'}, {status: 500})
    }

    // Google Maps Geocoding APIを呼び出し
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      return NextResponse.json({error: `ジオコーディングに失敗しました: ${data.status}`}, {status: 400})
    }

    // 最初の結果を返す
    const result = data.results[0]

    return NextResponse.json({
      formatted_address: result.formatted_address,
      location: result.geometry.location,
      place_id: result.place_id,
    })
  } catch (error) {
    console.error('Google Maps API ジオコーディングエラー:', error)
    return NextResponse.json({error: 'ジオコーディング中にエラーが発生しました'}, {status: 500})
  }
}
