'use client'
import React, {useMemo} from 'react'
import {Days} from '@cm/class/Days/Days'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {TbmRouteGroup, TbmBase} from '@prisma/client'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {haishaListData} from './getListData'
import {WorkStatusSelector, AddScheduleButton, ScheduleCard} from './CellComponents'
export const HaishaCard = React.memo(
  (props: {
    //
    fetchData
    scheduleListOnDate: any[]
    setModalOpen
    user?: haishaListData['userList'][number]
    tbmRouteGroup?: TbmRouteGroup
    date: Date
    tbmBase: TbmBase
  }) => {
    const {query, toggleLoad} = useGlobal()
    const mode = query.mode
    const {fetchData, scheduleListOnDate, setModalOpen, user, tbmRouteGroup, date, tbmBase} = props

    const ConfigArea = useMemo(() => {
      const userWorkStatus = user?.UserWorkStatus?.find(item => Days.validate.isSameDate(item.date, date))

      return (
        <section className="mb-2">
          <R_Stack className="w-full items-center justify-between gap-1">
            <R_Stack className="gap-1">
              {mode === 'DRIVER' && (
                <WorkStatusSelector userWorkStatus={userWorkStatus} user={user} date={date} fetchData={fetchData} />
              )}
            </R_Stack>

            <div>
              <AddScheduleButton
                date={date}
                tbmBase={tbmBase}
                user={user}
                tbmRouteGroup={tbmRouteGroup}
                setModalOpen={setModalOpen}
              />
            </div>
          </R_Stack>
        </section>
      )
    }, [user, date, tbmBase, tbmRouteGroup, setModalOpen, fetchData, mode])

    const ScheduleArea = useMemo(() => {
      if (!scheduleListOnDate?.length) return null

      return (
        <section>
          <C_Stack className="gap-1">
            {scheduleListOnDate.map((tbmDriveSchedule, i) => {
              const User = scheduleListOnDate.find(item => item.userId === tbmDriveSchedule.userId)?.User

              return (
                <div
                  // className={`${checkDoubbled() ? 'bg-red-200' : ''}`}
                  key={tbmDriveSchedule.id}
                >
                  <ScheduleCard
                    tbmDriveSchedule={tbmDriveSchedule}
                    user={User}
                    date={date}
                    setModalOpen={setModalOpen}
                    fetchData={fetchData}
                    query={query}
                    tbmBase={tbmBase}
                  />
                </div>
              )
            })}
          </C_Stack>
        </section>
      )
    }, [scheduleListOnDate, user, date, tbmBase, setModalOpen, fetchData, query])

    return (
      <C_Stack className={` justify-start text-xs leading-3  gap-0 `} {...{style: {width: 200}}}>
        <div className={`mb-auto`}>{ConfigArea}</div>
        <div className={``}>{ScheduleArea}</div>
      </C_Stack>
    )
  }
)
