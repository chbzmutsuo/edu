import {Days} from '@class/Days/Days'

// 型定義
interface TimeAddProps {
  time: string
  mins: number
}

interface TimeConvertResult {
  hour: number
  day: number
  mins: number
}

type TimeConvertMode = 'min-to-hour' | 'min-to-day' | 'hour-to-day' | 'day-to-hour' | 'day-to-min' | 'hour-to-min'

// ユーティリティ関数（メモ化対応）
const parseTimeString = (() => {
  const cache = new Map<string, [number, number]>()

  return (timeStr: string): [number, number] => {
    if (cache.has(timeStr)) {
      return cache.get(timeStr)!
    }

    const parts = timeStr.split(':')
    if (parts.length !== 2) {
      throw new Error(`Invalid time format: ${timeStr}. Expected HH:MM format.`)
    }

    const [hours, minutes] = parts.map(Number)

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid time values: ${timeStr}`)
    }

    const result: [number, number] = [hours, minutes]
    cache.set(timeStr, result)
    return result
  }
})()

const formatTime = (hours: number, minutes: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const validateDateInput = (date: any): Date => {
  if (!Days.validate.isDate(date)) {
    throw new Error('正しい日付を入力してください')
  }
  return new Date(date)
}

export class TimeClass {
  /**
   * 時刻に分を加算（型安全性とエラーハンドリング強化）
   */
  static addMinues = (props: TimeAddProps): string => {
    const {time, mins} = props

    try {
      const [hours, minutes] = parseTimeString(time)
      const date = new Date()
      date.setHours(hours, minutes + mins, 0, 0)

      const newHours = date.getHours()
      const newMinutes = date.getMinutes()

      return formatTime(newHours, newMinutes)
    } catch (error) {
      console.error('Error in addMinues:', error)
      throw error
    }
  }

  /**
   * 時刻間の差分を分で取得（最適化）
   */
  static getDiff = (start: string, end: string): number => {
    try {
      const [startHours, startMinutes] = parseTimeString(start)
      const [endHours, endMinutes] = parseTimeString(end)

      const startTotalMinutes = startHours * 60 + startMinutes
      const endTotalMinutes = endHours * 60 + endMinutes

      return endTotalMinutes - startTotalMinutes
    } catch (error) {
      console.error('Error in getDiff:', error)
      throw error
    }
  }

  /**
   * 時間スロット生成（効率化）
   */
  static getTimeSlots = (startTimeStr: string = '8:00', endTimeStr: string = '17:00', step: number = 30): string[] => {
    if (step <= 0) {
      throw new Error('Step must be positive number')
    }

    const slots: string[] = []
    let currentTime = startTimeStr

    // 無限ループ防止
    let iterations = 0
    const maxIterations = 1000

    try {
      while (TimeClass.getDiff(currentTime, endTimeStr) > 0 && iterations < maxIterations) {
        slots.push(currentTime)
        currentTime = TimeClass.addMinues({time: currentTime, mins: step})
        iterations++
      }
    } catch (error) {
      console.error('Error in getTimeSlots:', error)
      throw error
    }

    return slots
  }

  /**
   * 分間隔生成（型安全性とパフォーマンス向上）
   */
  static generateMinuteIntervals = (startDate: any, endDate: any, step: number = 1): Date[] => {
    if (step <= 0) {
      throw new Error('Step must be positive number')
    }

    const start = validateDateInput(startDate)
    const end = validateDateInput(endDate)

    if (start >= end) {
      throw new Error('開始日は終了日より前にしてください')
    }

    const intervals: Date[] = []
    const current = new Date(start)

    // 無限ループ防止
    const maxIntervals = 100000
    let count = 0

    while (current <= end && count < maxIntervals) {
      intervals.push(new Date(current))
      current.setMinutes(current.getMinutes() + step)
      count++
    }

    if (count >= maxIntervals) {
      console.warn('generateMinuteIntervals: Maximum intervals reached')
    }

    return intervals
  }

  /**
   * 分を時間文字列に変換（最適化）
   */
  static minutesToHourTimeString = (minutes: number): string | null => {
    if (typeof minutes !== 'number' || isNaN(minutes)) {
      return null
    }

    if (minutes === 0) {
      return '00:00'
    }

    const absMinutes = Math.abs(minutes)
    const hours = Math.floor(absMinutes / 60)
    const mins = absMinutes % 60
    const isNegative = minutes < 0

    const timeString = formatTime(hours, mins)
    return isNegative ? `-${timeString}` : timeString
  }

  /**
   * 時間文字列を分に変換（型安全性向上）
   */
  static HourTimeStringToMinutes = (timeString: string): number => {
    try {
      const [hours, minutes] = parseTimeString(timeString)
      return hours * 60 + minutes
    } catch (error) {
      console.error('Error in HourTimeStringToMinutes:', error)
      throw error
    }
  }

  /**
   * ミリ秒を分に変換（型安全性向上）
   */
  static toMin = (dateValue: number): number => {
    if (typeof dateValue !== 'number' || isNaN(dateValue)) {
      throw new Error('Invalid date value')
    }
    return dateValue / 1000 / 60
  }

  /**
   * 分の変換（型安全性向上）
   */
  static convertMin = ({mins, hourDivideNum}: {mins: number; hourDivideNum: number}): TimeConvertResult => {
    if (typeof mins !== 'number' || typeof hourDivideNum !== 'number') {
      throw new Error('Invalid input types')
    }

    if (hourDivideNum <= 0) {
      throw new Error('hourDivideNum must be positive')
    }

    const hour = mins / 60
    const day = (hour * (24 / hourDivideNum)) / 24

    return {hour, day, mins}
  }

  /**
   * 12:00-13:00の範囲内の分数を取得（最適化）
   */
  static getMinutesWithinNoonToOne = (from: Date, to: Date): number => {
    if (!Days.validate.isDate(from) || !Days.validate.isDate(to)) {
      throw new Error('Invalid date inputs')
    }

    if (from >= to) {
      return 0
    }

    // 12:00-13:00の範囲を設定
    const noonStart = new Date(from)
    noonStart.setHours(12, 0, 0, 0)

    const noonEnd = new Date(from)
    noonEnd.setHours(13, 0, 0, 0)

    // 範囲外チェック
    if (to <= noonStart || from >= noonEnd) {
      return 0
    }

    // 実際の重複範囲を計算
    const actualStart = from < noonStart ? noonStart : from
    const actualEnd = to > noonEnd ? noonEnd : to

    const diffMilliseconds = actualEnd.getTime() - actualStart.getTime()
    return Math.max(0, Math.floor(diffMilliseconds / (1000 * 60)))
  }

  /**
   * 時間単位変換（型安全性とパフォーマンス向上）
   */
  static convertTimeAsNumber = (value: number, mode: TimeConvertMode): number => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Invalid value input')
    }

    // 変換テーブル（効率化）
    const conversionMap: Record<TimeConvertMode, (val: number) => number> = {
      'min-to-hour': val => val / 60,
      'min-to-day': val => val / (60 * 24),
      'hour-to-day': val => val / 24,
      'day-to-hour': val => val * 24,
      'day-to-min': val => val * 24 * 60,
      'hour-to-min': val => val * 60,
    }

    const converter = conversionMap[mode]
    if (!converter) {
      throw new Error(`Invalid conversion mode: ${mode}`)
    }

    return Math.round(converter(value))
  }
}

// 型エクスポート
export type {TimeAddProps, TimeConvertResult, TimeConvertMode}
