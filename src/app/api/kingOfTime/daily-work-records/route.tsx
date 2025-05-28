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

// レート制限対応のための遅延関数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// GET: 日別勤怠データ取得
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url)

    // 必須パラメータ
    const date = searchParams.get('date') // YYYY-MM-DD形式
    const employeeCode = searchParams.get('employeeCode')

    // クエリパラメータの構築
    const params = new URLSearchParams()

    // 追加フィールドの指定
    const additionalFields =
      searchParams.get('additionalFields') ||
      'scheduledWorkTime,actualWorkTime,overtimeWorkTime,nonScheduledWorkTime,lateTime,earlyLeaveTime'

    if (additionalFields) {
      params.append('additionalFields', additionalFields)
    }

    // 従業員コード指定
    if (employeeCode) {
      params.append('employeeCode', employeeCode)
    }

    // 所属コード指定
    const departmentCode = searchParams.get('departmentCode')
    if (departmentCode) {
      params.append('departmentCode', departmentCode)
    }

    let endpoint: string

    if (date) {
      // 特定日付の勤怠データを取得
      const queryString = params.toString()
      endpoint = `/daily-work-records/${date}${queryString ? `?${queryString}` : ''}`
    } else {
      // 一覧取得
      const queryString = params.toString()
      endpoint = `/daily-work-records${queryString ? `?${queryString}` : ''}`
    }

    const workRecordsData = await kingOfTimeRequest(endpoint)

    return NextResponse.json({
      success: true,
      message: 'Daily work records retrieved successfully',
      data: workRecordsData,
      count: Array.isArray(workRecordsData) ? workRecordsData.length : 1,
      requestedDate: date,
      requestedEmployeeCode: employeeCode,
    })
  } catch (error) {
    console.error('KING OF TIME Daily Work Records API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {status: 500}
    )
  }
}

// POST: 複数日・複数従業員の勤怠データを一括取得
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      startDate,
      endDate,
      employeeCodes = [],
      departmentCode,
      additionalFields = 'scheduledWorkTime,actualWorkTime,overtimeWorkTime,nonScheduledWorkTime',
    } = body

    if (!startDate || !endDate) {
      return NextResponse.json({success: false, error: 'startDate and endDate are required'}, {status: 400})
    }

    const results: any[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    // 日付範囲をループ
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0] // YYYY-MM-DD形式

      try {
        const params = new URLSearchParams()
        if (additionalFields) params.append('additionalFields', additionalFields)
        if (departmentCode) params.append('departmentCode', departmentCode)

        // 従業員コードが指定されている場合は個別に取得
        if (employeeCodes.length > 0) {
          for (const empCode of employeeCodes) {
            params.set('employeeCode', empCode)
            const queryString = params.toString()
            const endpoint = `/daily-work-records/${dateStr}?${queryString}`

            const data = await kingOfTimeRequest(endpoint)
            results.push({
              date: dateStr,
              employeeCode: empCode,
              data,
            })

            // レート制限対応（1秒間隔）
            await delay(1000)
          }
        } else {
          // 全従業員の勤怠データを取得
          const queryString = params.toString()
          const endpoint = `/daily-work-records/${dateStr}${queryString ? `?${queryString}` : ''}`

          const data = await kingOfTimeRequest(endpoint)
          results.push({
            date: dateStr,
            data,
          })

          // レート制限対応（1秒間隔）
          await delay(1000)
        }
      } catch (error) {
        console.error(`Error fetching data for ${dateStr}:`, error)
        results.push({
          date: dateStr,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk daily work records retrieved',
      data: results,
      totalRecords: results.length,
      dateRange: {startDate, endDate},
    })
  } catch (error) {
    console.error('KING OF TIME Bulk Daily Work Records API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {status: 500}
    )
  }
}
