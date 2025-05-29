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

  const data = await response.json()
  return data
}

// GET: 従業員一覧取得
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)

    // クエリパラメータの構築
    const params = new URLSearchParams()

    // 追加フィールドの指定（所属情報なども含める）
    const additionalFields =
      searchParams.get('additionalFields') ||
      'departmentCode,departmentName,employeeGroupCode,employeeGroupName,hiredDate,resignationDate'

    if (additionalFields) {
      params.append('additionalFields', additionalFields)
    }

    // その他のパラメータ
    const departmentCode = searchParams.get('departmentCode')
    const employeeGroupCode = searchParams.get('employeeGroupCode')

    if (departmentCode) params.append('departmentCode', departmentCode)
    if (employeeGroupCode) params.append('employeeGroupCode', employeeGroupCode)

    const queryString = params.toString()
    const endpoint = `/employees${queryString ? `?${queryString}` : ''}`

    const employeesData = await kingOfTimeRequest(endpoint)

    return NextResponse.json({
      success: true,
      message: 'Employees data retrieved successfully',
      data: employeesData,
      count: employeesData?.length || 0,
    })
  } catch (error) {
    console.error('KING OF TIME Employees API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {status: 500}
    )
  }
}

// POST: 従業員データの登録（必要に応じて）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await kingOfTimeRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      data: result,
    })
  } catch (error) {
    console.error('KING OF TIME Employee Creation Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {status: 500}
    )
  }
}
