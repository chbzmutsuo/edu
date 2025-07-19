'use client'
//classを切り替える

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import GenbaDaySummary from '@app/(apps)/sohken/(parts)/genbaDay/GenbaDaySummary/GenbaDaySummary'
import {C_Stack, Circle, FitMargin, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'

import NewDateSwitcher from '@cm/components/utils/dates/DateSwitcher/NewDateSwitcher'
import {useGenbaDayBasicEditor} from '@app/(apps)/sohken/hooks/useGenbaDayBasicEditor'
import React from 'react'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {DayRemarkComponent, TopDayRemarkComponent} from '@app/(apps)/sohken/(pages)/genbaDay/DayRemarkComponent'
import {chechIsHoliday} from '@app/(apps)/sohken/api/cron/refreshGoogleCalendar/chechIsHoliday'

import {Alert} from '@cm/components/styles/common-components/Alert'
import useGDS_DND from '@app/(apps)/sohken/hooks/useGDS_DND'

export const GenbadayListClient = React.memo(
  (props: {holidays; calendars; today; tomorrow; users; shifts; genbaDayRecords; isMyPage; dayRemarksStates}) => {
    const {holidays, calendars, today, tomorrow, users, shifts, genbaDayRecords, isMyPage, dayRemarksStates} = props
    const {today: todayRecords, tomorrow: tomorrowRecords} = genbaDayRecords
    const {today: todayShifts, tomorrow: tomorrowShifts} = shifts
    const {today: todayUsers, tomorrow: tomorrowUsers} = users
    const {today: todayDayRemarks, tomorrow: tomorrowDayRemarks} = dayRemarksStates
    const {today: todayCalendars, tomorrow: tomorrowCalendars} = calendars

    const GenbaDayBasicEditor_HK = useGenbaDayBasicEditor()
    const {session, roles} = useGlobal()

    const [GDS_DND, setGDS_DND] = useGDS_DND()

    const pickMode = GDS_DND
    const editable = !!(!pickMode && !isMyPage && roles?.find(r => r.name === `管理者`))

    const dateFixedClass = `fixed top-10 pt-2 center-x bg-background w-full z-[30]`
    const stickyClass = 'fixed top-20 pt-2 w-[500px]  max-w-[90vw] bg-background p-1 z-[20]  border-b mb-1 justify-center'

    const wrapperHeightClass = `pt-8`

    const Today = () => {
      return (
        <div>
          <R_Stack className={stickyClass}>
            <strong>{formatDate(today, 'YYYY-MM-DD(ddd)')}</strong>
            {!isMyPage && (
              <TopDayRemarkComponent
                {...{
                  date: today,
                  editable: editable,
                  dayRemarksState: todayDayRemarks,
                }}
              />
            )}
          </R_Stack>
          <C_Stack className={`    items-center justify-between`}>
            <div>
              <C_Stack className={` gap-8    p-2`}>
                {todayRecords
                  .filter(data => {
                    return chechIsHoliday({holidays, date: data.date}) === false
                  })
                  .map((GenbaDay, i) => {
                    const shift = GenbaDay.GenbaDayShift
                    const isMyShift = isMyPage && shift?.some(s => s.userId === session?.id)
                    const bgColor = isMyShift ? 'rgba(244, 232, 190, 0.664)' : ''

                    return (
                      <div key={GenbaDay.id}>
                        <Paper {...{style: {background: bgColor, color: 'black'}}}>
                          <R_Stack>
                            <Circle {...{width: 24}}>{i + 1}</Circle>
                            <GenbaDaySummary
                              {...{
                                holidays,
                                GenbaDayBasicEditor_HK,
                                allShiftBetweenDays: todayShifts,
                                records: todayRecords,
                                GenbaDay,
                                editable: editable,
                              }}
                            />
                          </R_Stack>
                        </Paper>
                      </div>
                    )
                  })}
              </C_Stack>
            </div>

            <DayRemarkComponent
              {...{
                calendar: todayCalendars,
                users: todayUsers,
                dayRemarksState: todayDayRemarks,
                date: today,
                editable: editable,
                type: `bottom`,
              }}
            />
          </C_Stack>
        </div>
      )
    }

    const Tomorrow = () => {
      return (
        <div>
          <R_Stack className={stickyClass}>
            <strong>{formatDate(tomorrow, 'YYYY-MM-DD(ddd)')}</strong>
            {!isMyPage && (
              <TopDayRemarkComponent
                {...{
                  date: tomorrow,
                  editable: editable,
                  dayRemarksState: tomorrowDayRemarks,
                }}
              />
            )}
          </R_Stack>
          <C_Stack className={`    items-center justify-between`}>
            <div>
              <C_Stack className={` justify-between gap-8  p-2`}>
                {tomorrowRecords
                  .filter(data => {
                    return chechIsHoliday({holidays, date: data.date}) === false
                  })
                  .map((GenbaDay, i) => {
                    return (
                      <div key={GenbaDay.id}>
                        <Paper>
                          <R_Stack>
                            <Circle {...{width: 24}}>{i + 1}</Circle>
                            <GenbaDaySummary
                              {...{
                                holidays,
                                GenbaDayBasicEditor_HK,
                                allShiftBetweenDays: tomorrowShifts,
                                records: tomorrowRecords,
                                GenbaDay,
                                editable: editable,
                              }}
                            />
                          </R_Stack>
                        </Paper>
                      </div>
                    )
                  })}
              </C_Stack>
            </div>
            <DayRemarkComponent
              {...{
                calendar: tomorrowCalendars,
                users: tomorrowUsers,
                dayRemarksState: tomorrowDayRemarks,
                date: tomorrow,
                editable: editable,
                type: `bottom`,
              }}
            />
          </C_Stack>
        </div>
      )
    }

    return (
      <FitMargin className={` bg-background pt-10`}>
        {pickMode && (
          <div
            className={`
              fixed center-x-y
               z-[99999] -rotate-5 text-xl  animate-pulse font-bold`}
          >
            <Alert color={`green`}>移動先を指定してください</Alert>
          </div>
        )}

        <div className={dateFixedClass}>
          <NewDateSwitcher />
          <div className={`text-center mx-auto w-fit font-bold`}></div>
        </div>

        {isMyPage ? (
          <div className={wrapperHeightClass}>
            <Today />
          </div>
        ) : (
          <div className={wrapperHeightClass}>
            <R_Stack className={` mx-auto w-full  max-w-[1500px]  items-stretch   justify-center   gap-10 lg:justify-end`}>
              <Today />
              <Tomorrow />
            </R_Stack>
          </div>
        )}
      </FitMargin>
    )
  }
)

export default GenbadayListClient
