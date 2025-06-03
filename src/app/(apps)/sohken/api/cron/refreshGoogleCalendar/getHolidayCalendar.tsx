'use server'
import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import prisma from '@lib/prisma'

export const getHolidayCalendar = async (props: {whereQuery: {gte: Date; lte: Date}}) => {
  const {whereQuery} = props
  const from = whereQuery.gte
  const to = whereQuery.lte
  const days = Days.day.getDaysBetweenDates(from, to)

  const sunDays = days.filter(day => formatDate(day, `ddd`) === `日`)

  const forcedWorkDays = await prisma.forcedWorkDay.findMany({})

  const japaneseHolidays = await prisma.sohkenGoogleCalendar.findMany({
    where: {
      date: whereQuery,
      calendarId: `ja.japanese#holiday@group.v.calendar.google.com`,
    },
  })

  const holidays: {date: Date}[] = [
    ...sunDays.map(d => {
      return {date: d}
    }),
    ...japaneseHolidays
      .filter(d => !forcedWorkDays.some(f => Days.validate.isSameDate(f.date, d.date)))
      .map(d => {
        return {date: d.date}
      }),
  ]

  return {holidays}
}
