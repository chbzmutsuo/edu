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

// データ統合用の型定義
interface IntegratedWorkRecord {
  所属コード: string
  所属名: string
  所属グループコード: string
  所属グループ名: string
  従業員コード: string
  名前: string
  日時: string // 曜日なし
  所定時間: number // 分単位
  所定外時間: number // 分単位
  残業時間: number // 分単位
}

// POST: 統合データ取得（要求仕様に対応）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {startDate, endDate, employeeCodes = [], departmentCode} = body

    if (!startDate || !endDate) {
      return NextResponse.json({success: false, error: 'startDate and endDate are required'}, {status: 400})
    }

    console.log('統合データ取得開始:', {startDate, endDate, employeeCodes, departmentCode})

    // 1. 従業員データ取得
    console.log('従業員データ取得中...')
    const employeesParams = new URLSearchParams()
    employeesParams.append('additionalFields', 'departmentCode,departmentName,employeeGroupCode,employeeGroupName')
    if (departmentCode) employeesParams.append('departmentCode', departmentCode)

    const employeesData = await kingOfTimeRequest(`/employees?${employeesParams.toString()}`)
    await delay(1000) // レート制限対応

    // 2. 所属データ取得
    console.log('所属データ取得中...')
    const departmentsData = await kingOfTimeRequest('/departments')
    await delay(1000)

    // 3. 従業員グループデータ取得
    console.log('従業員グループデータ取得中...')
    const employeeGroupsData = await kingOfTimeRequest('/employee-groups')
    await delay(1000)

    // データをマップ化（高速検索用）
    const departmentMap = new Map()
    const employeeGroupMap = new Map()

    if (Array.isArray(departmentsData)) {
      departmentsData.forEach((dept: any) => {
        departmentMap.set(dept.departmentCode, dept)
      })
    }

    if (Array.isArray(employeeGroupsData)) {
      employeeGroupsData.forEach((group: any) => {
        employeeGroupMap.set(group.employeeGroupCode, group)
      })
    }

    // 対象従業員をフィルタリング
    let targetEmployees = Array.isArray(employeesData) ? employeesData : []
    if (employeeCodes.length > 0) {
      targetEmployees = targetEmployees.filter((emp: any) => employeeCodes.includes(emp.employeeCode))
    }

    console.log(`対象従業員数: ${targetEmployees.length}`)

    // 4. 日別勤怠データ取得と統合
    const integratedResults: IntegratedWorkRecord[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0] // YYYY-MM-DD形式
      console.log(`${dateStr}の勤怠データ取得中...`)

      try {
        // 日別勤怠データ取得
        const workRecordsParams = new URLSearchParams()
        workRecordsParams.append('additionalFields', 'scheduledWorkTime,actualWorkTime,overtimeWorkTime,nonScheduledWorkTime')
        if (departmentCode) workRecordsParams.append('departmentCode', departmentCode)

        const workRecordsData = await kingOfTimeRequest(`/daily-work-records/${dateStr}?${workRecordsParams.toString()}`)

        // データ統合処理
        if (Array.isArray(workRecordsData)) {
          for (const workRecord of workRecordsData) {
            // 対象従業員かチェック
            const employee = targetEmployees.find((emp: any) => emp.employeeCode === workRecord.employeeCode)

            if (employee) {
              const department = departmentMap.get(employee.departmentCode) || {}
              const employeeGroup = employeeGroupMap.get(employee.employeeGroupCode) || {}

              const integratedRecord: IntegratedWorkRecord = {
                所属コード: employee.departmentCode || '',
                所属名: department.departmentName || '',
                所属グループコード: employee.employeeGroupCode || '',
                所属グループ名: employeeGroup.employeeGroupName || '',
                従業員コード: employee.employeeCode || '',
                名前: `${employee.lastName || ''} ${employee.firstName || ''}`.trim(),
                日時: dateStr,
                所定時間: parseInt(workRecord.scheduledWorkTime || '0'),
                所定外時間: parseInt(workRecord.nonScheduledWorkTime || '0'),
                残業時間: parseInt(workRecord.overtimeWorkTime || '0'),
              }

              integratedResults.push(integratedRecord)
            }
          }
        }

        await delay(1000) // レート制限対応
      } catch (error) {
        console.error(`Error fetching data for ${dateStr}:`, error)
      }
    }

    console.log(`統合データ取得完了: ${integratedResults.length}件`)

    return NextResponse.json({
      success: true,
      message: 'Integrated work records retrieved successfully',
      data: integratedResults,
      totalRecords: integratedResults.length,
      dateRange: {startDate, endDate},
      summary: {
        targetEmployees: targetEmployees.length,
        departments: departmentMap.size,
        employeeGroups: employeeGroupMap.size,
      },
    })
  } catch (error) {
    console.error('KING OF TIME Integrated Data API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      {status: 500}
    )
  }
}

// GET: API仕様説明
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'KING OF TIME Integrated Data API',
    description:
      '所属コード、所属名、所属グループコード、所属グループ名、従業員コード、名前、日時、所定時間、所定外時間、残業時間を統合して取得',
    usage: {
      method: 'POST',
      endpoint: '/api/kingOfTime/integrated-data',
      body: {
        startDate: 'YYYY-MM-DD (required)',
        endDate: 'YYYY-MM-DD (required)',
        employeeCodes: ['従業員コード配列 (optional)'],
        departmentCode: '所属コード (optional)',
      },
    },
    responseFields: [
      '所属コード',
      '所属名',
      '所属グループコード',
      '所属グループ名',
      '従業員コード',
      '名前',
      '日時（曜日なし）',
      '所定時間',
      '所定外時間',
      '残業時間',
    ],
  })
}
