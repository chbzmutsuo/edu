import React from 'react'
import {getAllHolidays} from './_actions/calendar-actions'
import CalendarClient from './CalendarClient'

const CalendarPage = async () => {
  const {data: holidays} = await getAllHolidays()

  return <CalendarClient initialHolidays={holidays || []} />
}

export default CalendarPage
