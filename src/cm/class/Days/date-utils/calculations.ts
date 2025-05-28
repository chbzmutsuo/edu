import {DateInput} from '@class/Days/date-utils/date-utils-type'
import {formatDate} from '@class/Days/date-utils/formatters'

export const getMidnight = (date: DateInput = new Date()): Date => {
  const dt = new Date(date)

  const year = Number(formatDate(dt, 'YYYY'))
  const month = Number(formatDate(dt, 'MM'))
  const day = Number(formatDate(dt, 'DD'))

  // 日本時間の0:00を作成
  const midnight = new Date(year, month - 1, day, 0, 0, 0)

  // 日本時間の0:00をUTCに変換（日本時間は UTC+9 なので9時間引く）
  // midnight = addHours(midnight, -9)

  // UTCでの日本時間0:00は15:00になるはず
  if (midnight?.toISOString().includes(`15:00`) === false) {
    // console.warn(`getMidnight: UTCでの日本時間0:00が15:00になっていません`, midnight.toISOString())
  }
  return midnight
}

export const toUtc = (date: DateInput): Date => {
  const dt = new Date(date)

  const isDate = isValidDate(dt)
  if (!isDate) {
    throw new Error(`toUtc: ${dt} is not a date object`)
  }

  const result = addHours(dt, -9)

  return result
}

export const toJst = (date: DateInput): Date => {
  const dt = new Date(date)

  const isDate = isValidDate(dt)
  if (!isDate) {
    throw new Error(`toJst: ${dt} is not a date object`)
  }
  return addHours(dt, 9)
}

export const getMaxDate = (dates: Date[]): Date | null => {
  if (dates.length === 0) return null
  return new Date(Math.max(...dates.map(date => date.getTime())))
}

export const getMinimumDate = (dates: Date[]): Date | null => {
  if (dates.length === 0) return null
  return new Date(Math.min(...dates.map(date => date.getTime())))
}

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export const calcAge = (birthday: DateInput): number => {
  const today = new Date()
  const birthDate = new Date(birthday)

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// バリデーション関数
const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}
