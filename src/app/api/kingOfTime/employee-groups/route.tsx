import {NextRequest, NextResponse} from 'next/server'

// KING OF TIME API設定
const KING_OF_TIME_API_BASE_URL = 'https://api.kingtime.jp/v1.0'

const getAccessToken = () => {
  const token = process.env.KING_OF_TIME_ACCESS_TOKEN
  if (!token) {
    throw new Error('KING_OF_TIME_ACCESS_TOKEN environment variable is not set')
  }
  return token
}

const kingOfTimeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAccessToken()

  const response = await fetch(`${KING_OF_TIME_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`KING OF TIME API Error: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

// GET: 従業員グループデータ一覧取得
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)

    // クエリパラメータの構築
    const params = new URLSearchParams()

    // 追加フィールドの指定
    const additionalFields = searchParams.get('additionalFields')
    if (additionalFields) {
      params.append('additionalFields', additionalFields)
    }

    const queryString = params.toString()
    const endpoint = `/employee-groups${queryString ? `?${queryString}` : ''}`

    const employeeGroupsData = await kingOfTimeRequest(endpoint)

    return NextResponse.json({
      success: true,
      message: 'Employee groups data retrieved successfully',
      data: employeeGroupsData,
      count: employeeGroupsData?.length || 0,
    })
  } catch (error) {
    console.error('KING OF TIME Employee Groups API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {status: 500}
    )
  }
}
