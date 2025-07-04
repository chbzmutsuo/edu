'use client'
//classを切り替える

import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {Paper} from '@components/styles/common-components/paper'

import React, {useEffect, useState} from 'react'
import {DayRemarks, DayRemarksUser, User} from '@prisma/client'
import {createUpdate} from '@lib/methods/createUpdate'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import useModal from '@components/utils/modal/useModal'
import {IsInShift} from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/Stars'
import {IsInKyuka} from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/Stars'
import {IsInKyukaTodoke} from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/Stars'
import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import {Button} from '@components/styles/common-components/Button'
import {doTransaction} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {useRouter} from 'next/navigation'
import {targetUsers} from '@app/(apps)/sohken/api/cron/targetUsers'
import BasicModal from '@components/utils/modal/BasicModal'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import {ColBuilder} from '@app/(apps)/sohken/class/ColBuilder'

type dayRemarksType = DayRemarks & {
  DayRemarksUser: (DayRemarksUser & {User: User})[]
}

export const TopDayRemarkComponent = React.memo((props: {date; editable; dayRemarksState}) => {
  const router = useRouter()
  const [dayRemarksState, setdayRemarksState] = useState<any | null>(props.dayRemarksState)
  const {date} = props
  return (
    <div className={`ml-8 text-lg font-bold`}>
      <label>
        <span className={` mr-2`}>#</span>
        <input
          className="w-[60px] rounded-sm border p-1 text-center "
          value={dayRemarksState?.ninkuCount ?? ''}
          type="number"
          onChange={async e => {
            const nextNinkuCount = e.target.value ? Number(e.target.value) : null
            setdayRemarksState({...dayRemarksState, ninkuCount: nextNinkuCount})
            await doStandardPrisma(`dayRemarks`, `upsert`, {
              where: {date},
              ...createUpdate({date, ninkuCount: nextNinkuCount}),
            })
            router.refresh()
          }}
        />
      </label>
    </div>
  )
})

export const DayRemarkComponent = React.memo((props: {calendar; users; date; editable; dayRemarksState}) => {
  const {calendar, users, date, editable} = props

  const [dayRemarksState, setdayRemarksState] = useState<dayRemarksType | null>(props.dayRemarksState)
  const [loading, setloading] = useState(false)
  const {Modal, handleOpen, handleClose, open, setopen} = useModal()

  const initState = async () => {
    setloading(false)
  }

  useEffect(() => {
    initState()
  }, [date])

  if (loading || !dayRemarksState) return <PlaceHolder />

  const freeUser = users.filter(user => {
    const noShift = user.GenbaDayShift.length === 0

    const userDayRemarks = user.DayRemarksUser.filter(item => {
      return Days.validate.isSameDate(item.DayRemarks.date, date)
    })

    const kyuka = userDayRemarks.filter(item => {
      const bool = item.kyuka + item.kyukaTodoke

      return bool
    })

    const hasKyuka = kyuka.length > 0

    return noShift && !hasKyuka
  })

  return (
    <div>
      <Modal {...{handleClose}}>
        <UserListSelector
          {...{
            users,
            date,
            dayRemarksState,
            initState,
            handleClose,
            dataKey: open.dataKey,
          }}
        />
      </Modal>

      <C_Stack className={`w-[500px] max-w-[95vw] p-2`}>
        <Paper className={``}>
          <strong>
            倉庫
            <small className={`ml-2`}>自動表示()</small>
          </strong>
          <R_Stack className={`text-red-500`}>
            {freeUser
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .filter(user => {
                const isKantokusha = (user.UserRole ?? []).some(role => role?.RoleMaster.name === `監督者`)

                return !isKantokusha
              })
              .map(user => {
                return <div key={user.id}>{user?.name}</div>
              })}
          </R_Stack>
          <small>*監督者は非表示</small>
        </Paper>
        <Paper
          className={`onHover`}
          onClick={() => {
            if (editable) {
              setopen({dayRemarksState, dataKey: `kyuka`})
            }
          }}
        >
          <strong>
            <span className={`text-blue-600`}>■</span>
            休暇
            <small className={`ml-2`}>手動変更</small>
          </strong>
          <R_Stack className={`text-red-500`}>
            {dayRemarksState.DayRemarksUser.sort((a, b) => a.User.sortOrder - b.User.sortOrder)
              .filter(item => item[`kyuka`])
              .map(item => {
                return <div key={item.id}>{item?.User?.name}</div>
              })}
          </R_Stack>
        </Paper>
        <Paper
          className={`onHover`}
          onClick={() => {
            if (editable) {
              setopen({dayRemarksState, dataKey: `kyukaTodoke`})
            }
          }}
        >
          <strong>
            <span className={`text-yellow-600`}>⚫︎</span>
            休暇願い
            <small className={`ml-2`}>手動変更</small>
          </strong>
          <R_Stack className={`text-red-500`}>
            {dayRemarksState.DayRemarksUser.sort((a, b) => a.User.sortOrder - b.User.sortOrder)
              .filter(item => item[`kyukaTodoke`])
              .map(item => {
                return <div key={item.id}>{item?.User?.name}</div>
              })}
          </R_Stack>
        </Paper>
        <Paper>
          <strong>
            <span className={`text-yellow-600`}>⚫︎</span>
            予定
            <small className={`ml-2`}>Google連携</small>
          </strong>

          <C_Stack>
            {targetUsers
              .filter(data => data.name !== '日本のカレンダー')

              .map((item: any, i) => {
                const events = calendar

                  .filter(event => {
                    const isTarget = Days.validate.isSameDate(event.date, date) && event.calendarId === item.email

                    return isTarget
                  })
                  .sort((a, b) => {
                    return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
                  })
                return (
                  <div key={i} className={`border-b`}>
                    <div>{item.name}</div>
                    {events.length === 0 && <small>予定なし</small>}
                    <div>
                      {events.map(event => {
                        const start = formatDate(event.startAt, 'HH:mm')
                        const end = formatDate(event.endAt, 'HH:mm')

                        return (
                          <div key={event.id}>
                            <R_Stack className={`gap-1 text-sm`}>
                              <span>・</span>

                              <span>{event.summary}</span>

                              <>
                                (<span>{start}</span>
                                {end && (
                                  <>
                                    <span>~</span>
                                    <span>{end}</span>
                                  </>
                                )}
                                )
                              </>
                            </R_Stack>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </C_Stack>
        </Paper>
        <Paper>
          <TextArea
            {...{
              editable,
              date,
              defaultValue: '',
              label: `備考欄`,
              dataKey: `bikou`,
              dayRemarksState,
              setdayRemarksState,
            }}
          />
        </Paper>
        <Paper>
          <C_Stack>
            <TextArea
              {...{
                editable,
                date,
                defaultValue: ``,
                label: `連絡事項`,
                dataKey: `shinseiGyomu`,
                dayRemarksState,
                setdayRemarksState,
              }}
            />
            <FileUploader ParentData={dayRemarksState} />
          </C_Stack>
        </Paper>
      </C_Stack>
    </div>
  )
})

const UserListSelector = React.memo((props: {users; date; dayRemarksState; dataKey; initState; handleClose}) => {
  const {users, date, dayRemarksState, dataKey, initState, handleClose} = props
  const {router} = useGlobal()
  const [list, setList] = useState(
    users.map(data => {
      const isTarget = dayRemarksState?.DayRemarksUser?.find(user => user.userId === data.id)?.[dataKey] === true
      return {
        id: data.id,
        isTarget,
      }
    })
  )

  return (
    <C_Stack className={` items-center gap-4 p-4`}>
      <C_Stack className={` max-h-[50vh] overflow-y-auto`}>
        {users.map(item => {
          const DayRemark = item.DayRemarksUser.find(remark => {
            return Days.validate.isSameDate(remark?.DayRemarks?.date, date)
          })
          const shiftsOnOtherGembaOnSameDate = item.GenbaDayShift
          // const isTarmget = dayRemarksState?.DayRemarksUser?.find(user => user.userId === item.id)?.[dataKey] === true

          const checked = list.find(data => item.id === data.id)?.isTarget

          return (
            <R_Stack key={item.id} className={` w-[240px]  justify-between border-b  text-lg`}>
              <R_Stack className={`items-start gap-0.5 leading-3`}>
                <div>{item.name}</div>
                <IsInShift {...{hasShift: shiftsOnOtherGembaOnSameDate.length}} />
                <IsInKyukaTodoke {...{DayRemark}} />
                <IsInKyuka {...{DayRemark}} />
              </R_Stack>
              <div>
                <input
                  onChange={async e => {
                    setList(prev => {
                      return prev.map(prevItem => {
                        if (prevItem.id === item.id) {
                          prevItem.isTarget = e.target.checked
                        }

                        return prevItem
                      })
                    })
                  }}
                  type="checkbox"
                  className={`h-6 w-6`}
                  checked={checked}
                />
              </div>
            </R_Stack>
          )
        })}
      </C_Stack>

      <Button
        color={`blue`}
        onClick={async () => {
          await doTransaction({
            transactionQueryList: list.map(data => {
              return {
                model: `dayRemarksUser`,
                method: `upsert`,
                queryObject: {
                  where: {
                    unique_dayRemarksId_userId: {
                      dayRemarksId: dayRemarksState.id,
                      userId: data.id,
                    },
                  },
                  ...createUpdate({
                    dayRemarksId: dayRemarksState.id,
                    userId: data.id,
                    [dataKey]: data.isTarget,
                  }),
                },
              }
            }),
          })

          router.refresh()
          initState()
          handleClose()
        }}
      >
        更新
      </Button>
    </C_Stack>
  )
})

const TextArea = React.memo((props: {label; dataKey; dayRemarksState; setdayRemarksState; defaultValue; editable; date}) => {
  const {label, dataKey, dayRemarksState, setdayRemarksState, defaultValue, editable, date} = props
  const [value, setvalue] = useState(dayRemarksState?.[dataKey] ?? defaultValue)

  return (
    <Paper>
      <strong>{label}</strong>
      <br />
      <textarea
        disabled={!editable}
        className={`h-[180px] w-full max-w-[95vw] border p-1`}
        {...{
          onBlur: async e => {
            await doStandardPrisma(`dayRemarks`, `upsert`, {
              where: {date},
              ...createUpdate({date, [dataKey]: e.target.value}),
            })
            setdayRemarksState({...dayRemarksState, [dataKey]: e.target.value})
          },
          onChange: e => setvalue(e.target.value),
        }}
        value={value}
      ></textarea>
    </Paper>
  )
})

const FileUploader = ({ParentData}) => {
  const useGlobalProps = useGlobal()
  return (
    <R_Stack className={` justify-between p-2`}>
      {ParentData.DayRemarksFile.length > 0 && (
        <div className={` text-error-main text-center`}>{ParentData.DayRemarksFile.length}件のファイルが登録されています。</div>
      )}

      <BasicModal {...{toggle: <Button>添付ファイル</Button>}}>
        <ChildCreator
          {...{
            ...{ParentData, useGlobalProps},
            columns: ColBuilder.DayRemarksFile({useGlobalProps}),
            models: {parent: `dayRemarks`, children: `dayRemarksFile`},
          }}
        />
      </BasicModal>
    </R_Stack>
  )
}
