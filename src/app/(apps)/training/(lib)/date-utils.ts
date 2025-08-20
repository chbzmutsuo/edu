import {formatDate} from '@cm/class/Days/date-utils/formatters'

/**
 * 文字列をDateオブジェクトに変換
 * @param dateStr 日付文字列（YYYY-MM-DD形式）
 * @returns Dateオブジェクト
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

/**
 * 今日の日付を取得
 * @returns 今日の日付文字列（YYYY-MM-DD形式）
 */
export function getTodayString(): string {
  return formatDate(new Date())
}

/**
 * 指定された月の開始日と終了日を取得
 * @param date 基準となる日付
 * @returns 月の開始日と終了日
 */
export function getMonthRange(date: Date) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return {startOfMonth, endOfMonth}
}

/**
 * 日付が同じかどうかを判定
 * @param date1 日付1
 * @param date2 日付2
 * @returns 同じ日付の場合true
 */
export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
  )
}
