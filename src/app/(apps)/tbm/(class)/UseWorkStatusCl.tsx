import {UserWorkStatusItem} from '@app/(apps)/tbm/(server-actions)/userWorkStatusActions'
import {Days} from '@cm/class/Days/Days'
import {Time} from '@cm/class/Time'

export class UseWorkStatusCl {
  private userWorkStatus: UserWorkStatusItem
  private _calculated: boolean = false

  // 計算結果のキャッシュ
  private _kosokuMins: number = 0
  private _rodoMins: number = 0
  private _kyukeiMins: number = 0
  private _shinyaKyukeiMins: number = 0
  private _kyusokuMins: number = 0
  private _shoteinai: number = 0
  private _jikangai1: number = 0
  private _shinyaTime: number = 0
  private _shinyaZangyo: number = 0
  private _kyujitsuShukkin: number = 0

  constructor(userWorkStatus: UserWorkStatusItem) {
    this.userWorkStatus = userWorkStatus
  }

  /**
   * 月間データから合計値とサマリーを計算
   */
  static calculateMonthlySummary(
    userWorkStatusData: UserWorkStatusItem[],
    selectedUserId: number | undefined,
    monthDates: Date[]
  ) {
    const dailyResults = monthDates.map(date => {
      const isFirstDate = date.getDate() === 1
      const userWorkStatus = userWorkStatusData.find(item => {
        return item.userId === selectedUserId && Days.validate.isSameDate(new Date(item.date), date)
      })

      if (userWorkStatus) {
        return new UseWorkStatusCl(userWorkStatus)
      }
    })

    // 月間合計値
    const monthlyTotals = {
      kosokuMins: 0,
      rodoMins: 0,
      kyukeiMins: 0,
      shinyaKyukeiMins: 0,
      kyusokuMins: 0,
      shoteinai: 0,
      jikangai1: 0,
      jikangai2: 0,
      shinyaTime: 0,
      shinyaZangyo: 0,
      kyujitsuShukkin: 0,
    }

    // サマリー集計用
    let workDays = 0 // 出勤日数
    let holidays = 0 // 公休日数
    let absences = 0 // 欠勤日数
    let holidayWork = 0 // 休日出勤
    let earlyLeave = 0 // 早退日数
    let paidLeave = 0 // 有給休暇

    dailyResults.forEach(dailyStatus => {
      if (dailyStatus && dailyStatus.hasWorkData()) {
        const workStatus = dailyStatus.getWorkStatus()

        // 各時間の合計
        monthlyTotals.kosokuMins += dailyStatus.getKosokuMins()
        monthlyTotals.rodoMins += dailyStatus.getRodoMins()
        monthlyTotals.kyukeiMins += dailyStatus.getKyukeiMins()
        monthlyTotals.shinyaKyukeiMins += dailyStatus.getShinyaKyukeiMins()
        monthlyTotals.kyusokuMins += dailyStatus.getKyusokuMins()
        monthlyTotals.shoteinai += dailyStatus.getShoteinai()

        monthlyTotals.jikangai1 += dailyStatus.getJikangai1()
        monthlyTotals.shinyaTime += dailyStatus.getShinyaTime()
        monthlyTotals.shinyaZangyo += dailyStatus.getShinyaZangyo()

        monthlyTotals.kyujitsuShukkin += dailyStatus.getKyujitsuShukkin()

        // サマリー集計
        switch (workStatus) {
          case '01': // 通常出勤
            workDays++
            break
          case '02': // 公休
            holidays++
            break
          case '03': // 欠勤
            absences++
            break
          case '04': // 有給休暇
            paidLeave++
            break
          case '05': // 早退
            workDays++
            earlyLeave++
            break
          case '06': // 休日出勤
            holidayWork++
            break
          default:
            if (dailyStatus.getStartTime()) {
              workDays++
            }
        }
      }
    })

    const originalShoteiTotal = monthlyTotals.shoteinai

    const shoteiTotal = Math.min(160 * 60, originalShoteiTotal)

    monthlyTotals.shoteinai = shoteiTotal

    monthlyTotals.shoteinai = Math.min(160 * 60, monthlyTotals.shoteinai)
    const rest = originalShoteiTotal - shoteiTotal

    const jikangai1 = monthlyTotals.jikangai1

    const jikangai1_b = jikangai1 + rest

    const jikangai1_c = Math.min(jikangai1_b, 60 * 60)
    monthlyTotals.jikangai1 = jikangai1_c
    monthlyTotals.jikangai2 = jikangai1_b - jikangai1_c

    const totalWorkDays = workDays + holidayWork
    const averageDailyHours = totalWorkDays > 0 ? monthlyTotals.rodoMins / totalWorkDays : 0

    return {
      monthlyTotals,
      summary: {
        workDays,
        holidays,
        absences,
        holidayWork,
        earlyLeave,
        paidLeave,
        totalWorkDays,
        averageDailyHours,
      },
      // dailyResults,
    }
  }

  /**
   * 分を時:分形式の文字列に変換
   */
  static formatMinutesToTime(minutes: number): string {
    if (minutes === 0) return '0:00'
    const sign = minutes < 0 ? '-' : ''
    const absMinutes = Math.abs(minutes)
    const hours = Math.floor(absMinutes / 60)
    const mins = absMinutes % 60
    return `${sign}${hours}:${mins.toString().padStart(2, '0')}`
  }

  /**
   * 時間計算を実行（初回のみ）
   */
  private calculate() {
    if (this._calculated) return

    if (this.userWorkStatus) {
      // 時間フィールドの変換
      const timeFields = Object.fromEntries(
        ['kyukeiMins', 'shinyaKyukeiMins', 'kyusokuMins'].map(key => [key, Time.str.strToMins(this.userWorkStatus?.[key] ?? '')])
      )

      // if(this.userWorkStatus)

      this._kyukeiMins = timeFields.kyukeiMins
      this._shinyaKyukeiMins = timeFields.shinyaKyukeiMins
      this._kyusokuMins = timeFields.kyusokuMins

      const startTime = this.getStartTime()
      const endTime = this.getEndTime()
      const workingMinutes = startTime && endTime ? Time.str.calcMinDiff(startTime, endTime) : 0

      this._kosokuMins = workingMinutes - this._kyusokuMins
      this._rodoMins = workingMinutes - this._kyukeiMins - this._kyusokuMins
    }

    // 各種計算
    this._shoteinai = this.calculateShoteinai()

    this._jikangai1 = this.calculateJikangai1()
    this._shinyaTime = this.calculateShinyaTime()
    this._shinyaZangyo = this._shinyaTime - this._shinyaKyukeiMins
    this._kyujitsuShukkin = this.calculateKyujitsuShukkin()

    this._calculated = true
  }

  // Getter メソッド群
  /**
   * 拘束時間（分）を取得
   */
  getKosokuMins(): number {
    this.calculate()
    return this._kosokuMins
  }

  /**
   * 労働時間（分）を取得
   */
  getRodoMins(): number {
    this.calculate()
    return this._rodoMins
  }

  /**
   * 休憩時間（分）を取得
   */
  getKyukeiMins(): number {
    this.calculate()
    return this._kyukeiMins
  }

  /**
   * 深夜休憩時間（分）を取得
   */
  getShinyaKyukeiMins(): number {
    this.calculate()
    return this._shinyaKyukeiMins
  }

  /**
   * 休息時間（分）を取得
   */
  getKyusokuMins(): number {
    this.calculate()
    return this._kyusokuMins
  }

  /**
   * 所定内時間（分）を取得
   */
  getShoteinai(): number {
    this.calculate()
    return this._shoteinai
  }

  /**
   * 時間外1（分）を取得
   */
  getJikangai1(): number {
    this.calculate()
    return this._jikangai1
  }

  /**
   * 深夜時間（分）を取得
   */
  getShinyaTime(): number {
    this.calculate()
    return this._shinyaTime
  }

  /**
   * 深夜残業時間（分）を取得
   */
  getShinyaZangyo(): number {
    this.calculate()

    return this._shinyaZangyo
  }

  /**
   * 休日出勤時間（分）を取得
   */
  getKyujitsuShukkin(): number {
    this.calculate()
    return this._kyujitsuShukkin
  }

  /**
   * 勤務状況を取得
   */
  getWorkStatus(): string | null {
    return this.userWorkStatus?.workStatus || null
  }

  /**
   * 開始時間を取得
   */
  getStartTime(): string | null {
    return this.userWorkStatus?.startTime || null
  }

  /**
   * 終了時間を取得
   */
  getEndTime(): string | null {
    return this.userWorkStatus?.endTime || null
  }

  /**
   * 時間外労働があるかチェック
   */
  hasOvertime(): boolean {
    return this.getJikangai1() > 0
  }

  /**
   * 深夜労働があるかチェック
   */
  hasLateNightWork(): boolean {
    return this.getShinyaTime() > 0
  }

  /**
   * 勤務データが存在するかチェック
   */
  hasWorkData(): boolean {
    return !!this.userWorkStatus
  }

  /**
   * 全ての計算結果をオブジェクトで取得
   */
  getAllTimeData() {
    this.calculate()
    return {
      kosokuMins: this._kosokuMins,
      rodoMins: this._rodoMins,
      kyukeiMins: this._kyukeiMins,
      shinyaKyukeiMins: this._shinyaKyukeiMins,
      kyusokuMins: this._kyusokuMins,
      shoteinai: this._shoteinai,
      jikangai1: this._jikangai1,
      shinyaTime: this._shinyaTime,
      shinyaZangyo: this._shinyaZangyo,
      kyujitsuShukkin: this._kyujitsuShukkin,
      workStatus: this.getWorkStatus(),
      startTime: this.getStartTime(),
      endTime: this.getEndTime(),
    }
  }

  // 計算メソッド群（プライベート）
  /**
   * 所定内時間を計算
   */
  private calculateShoteinai(): number {
    const workStatus = this.getWorkStatus()
    const startTime = this.getStartTime()

    const diasbled = !workStatus || workStatus === '02' || workStatus === '03' || workStatus === '05' || !startTime

    if (diasbled) {
      return 0
    }

    const eightHoursInMins = 8 * 60 // 8時間を分に変換
    return Math.min(eightHoursInMins, this._rodoMins)
  }

  /**
   * 時間外1を計算
   */
  private calculateJikangai1(): number {
    const threshold = (24 / 3) * 60
    const workStatus = this.getWorkStatus()
    const startTime = this.getStartTime()

    if (workStatus === '1' || !startTime) {
      return 0
    }

    if (this._rodoMins > threshold) {
      return this._rodoMins - threshold
    }

    return 0
  }

  /**
   * 深夜時間を計算
   */
  private calculateShinyaTime(): number {
    const workStatus = this.getWorkStatus()
    const startTime = this.getStartTime()
    const endTime = this.getEndTime()

    if (workStatus === '2') {
      return 0
    }

    if (!startTime || !endTime) {
      return 0
    }

    const startMins = Time.str.strToMins(startTime)
    const endMins = Time.str.strToMins(endTime)

    // 終了時間が開始時間より早い場合は翌日とみなす
    const adjustedEndMins = endMins <= startMins ? endMins + 24 * 60 : endMins

    // 22:00以降の深夜時間を計算
    const lateNightStart = Math.max(startMins, 22 * 60) // 22:00
    const lateNightEnd = Math.min(adjustedEndMins, 29 * 60) // 29:00 (翌5:00)
    const lateNightMins = Math.max(0, lateNightEnd - lateNightStart)

    // 5:00以前の深夜時間を計算
    const earlyNightMins = startMins < 5 * 60 ? Math.max(0, Math.min(adjustedEndMins, 5 * 60) - startMins) : 0

    return lateNightMins + earlyNightMins
  }

  /**
   * 休日出勤時間を計算
   * Excel式: =IF(OR($D12=1,$D12=2,$D12=4,$D12=5,$D12=6,$D12="",ISBLANK($G12)),"",MIN("8:00",$L12))
   * 勤務状況が1,2,4,5,6,空白、または開始時間がブランクの場合は0
   * それ以外の場合は労働時間と8時間の小さい方
   */
  private calculateKyujitsuShukkin(): number {
    const workStatus = this.getWorkStatus()
    const startTime = this.getStartTime()

    // 勤務状況が1,2,4,5,6,空白、または開始時間がブランクの場合は0
    if (
      !workStatus ||
      workStatus === '01' ||
      workStatus === '02' ||
      workStatus === '04' ||
      workStatus === '05' ||
      workStatus === '06' ||
      !startTime
    ) {
      return 0
    }

    // 労働時間と8時間（480分）の小さい方
    const eightHoursInMins = 8 * 60 // 8時間を分に変換
    return Math.min(eightHoursInMins, this._rodoMins)
  }
}
