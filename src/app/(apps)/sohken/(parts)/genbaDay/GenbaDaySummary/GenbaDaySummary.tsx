'use client'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'
import React from 'react'
import {Paper, Wrapper} from '@components/styles/common-components/paper'
import Basics from '@app/(apps)/sohken/(parts)/genbaDay/GenbaDaySummary/Main'
import Sub from '@app/(apps)/sohken/(parts)/genbaDay/GenbaDaySummary/Sub'
import {Genba, GenbaDay, GenbaDayTaskMidTable} from '@prisma/client'
import {useGenbaDayBasicEditor} from '@app/(apps)/sohken/hooks/useGenbaDayBasicEditor'
import {chechIsHoliday} from '@app/(apps)/sohken/api/cron/refreshGoogleCalendar/chechIsHoliday'
import useGDS_DND from '@app/(apps)/sohken/hooks/useGDS_DND'
import {ButtonDisplay} from '@app/(apps)/sohken/(parts)/genbaDay/GenbaDaySummary/ButtonDisplay'
import useWindowSize from '@hooks/useWindowSize'

const GenbaDaySummary = (props: {
  GenbaDayBasicEditor_HK: ReturnType<typeof useGenbaDayBasicEditor>
  editable
  records?: any
  GenbaDay
  allShiftBetweenDays: any
  holidays
}) => {
  const {GenbaDayBasicEditor_HK, editable = true, records, GenbaDay, allShiftBetweenDays, holidays} = props

  const isHoliday = chechIsHoliday({holidays, date: GenbaDay.date})

  const {Genba, GenbaDayTaskMidTable, active} = GenbaDay as GenbaDay & {
    Genba: Genba
    GenbaDayTaskMidTable: GenbaDayTaskMidTable[]
  }

  const {toggleLoad, pathname, query, session} = useGlobal()
  const {PC} = useWindowSize()
  const [GDS_DND, setGDS_DND] = useGDS_DND()

  const commonProps = {GDS_DND, setGDS_DND, GenbaDay}

  return (
    <div className={isHoliday ? 'bg-black/50' : ''}>
      <div style={{width: 420, maxWidth: '90vw'}} className={`relative w-full `}>
        {editable && (
          <div className={`  absolute right-4 top-4  z-10 w-fit rotate-6 text-lg font-bold `}>
            <ButtonDisplay {...{active, GenbaDay, toggleLoad}} />
          </div>
        )}

        <div className={`${active ? '' : 'opacity-30'}`}>
          <C_Stack className={`gap-0.5`}>
            <Wrapper className={` bg-transparent! `}>
              <Paper>
                <Basics
                  {...{
                    GenbaDayBasicEditor_HK,
                    pathname,
                    GenbaDayTaskMidTable,
                    GenbaDay,
                    editable,
                  }}
                />
              </Paper>
            </Wrapper>

            <Wrapper className={` bg-transparent!`}>
              <Sub {...{records, GenbaDay, editable, commonProps, PC, allShiftBetweenDays}} />
            </Wrapper>
          </C_Stack>
        </div>
      </div>
    </div>
  )
}

export default GenbaDaySummary

export type genbaScheduleStatusString = '完了' | '不要' | '済' | '未完了'
