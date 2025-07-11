import {IsInKyuka, IsInKyukaTodoke, isRed} from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/Stars'
import {IsInShift} from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/Stars'
import {userForSelect} from '@app/(apps)/sohken/class/sohken-constants'
import {Days} from '@class/Days/Days'
import {anyObject} from '@cm/types/utility-types'
import {Button} from '@components/styles/common-components/Button'
import {C_Stack, R_Stack} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
import PlaceHolder from '@components/utils/loader/PlaceHolder'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {doTransaction, transactionQuery} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {GenbaDayShift, Prisma} from '@prisma/client'
import React, {useState} from 'react'
import {chain_sohken_genbaDayUpdateChain} from 'src/non-common/(chains)/getGenbaScheduleStatus/chain_sohken_genbaDayUpdateChain'

type selectedUserObjectType = {
  [key: string]: {
    active: boolean
    from: string | undefined
    to: string | undefined
    shiftOnOtherDate: GenbaDayShift[]
    directGo: boolean
    directReturn: boolean
    important: boolean
    shokucho: boolean
  }
}

export default function MultipleUserSelector({currentRelationalModelRecords, GenbaDay, useGlobalProps, handleClose}) {
  let {data: options} = useDoStandardPrisma(`user`, 'findMany', {
    orderBy: [{sortOrder: 'asc'}],
    where: {
      ...userForSelect.config.where,
      UserRole: {none: {RoleMaster: {name: `監督者`}}},
    },
    include: {
      DayRemarksUser: {where: {DayRemarks: {date: {equals: GenbaDay.date}}}},
      GenbaDayShift: {
        include: {GenbaDay: {}},
        where: {
          GenbaDay: {date: {equals: GenbaDay.date}},
        },
        orderBy: {
          User: {
            sortOrder: 'asc',
          },
        },
      },
    },
  })

  if (!options) return <PlaceHolder />
  options = options.sort((a, b) => {
    const shift = a?.GenbaDayShift.find(shift => shift.genbaDayId === GenbaDay?.id)

    return shift?.from ? b.sortOrder - a.sortOrder : 0
  })

  const Main = () => {
    const {toggleLoad} = useGlobalProps
    const {optionList, defaultValue} = init({options, currentRelationalModelRecords, GenbaDay})

    const [selectedUserObject, setselectedUserObject] = useState<selectedUserObjectType>(defaultValue)

    const bulkUpdateUsersOnGenbaDay = async () => {
      toggleLoad(
        async () => {
          const transactionQueryList: transactionQuery[] = []
          const currentRegisterdUsers = currentRelationalModelRecords.map(record => record.User.id)
          type user = {
            id: number
            from: string
            to: string
            directGo: boolean
            directReturn: boolean
            important: boolean
            shokucho: boolean
          }
          const usersToUpsert = Object.entries(selectedUserObject)
            .map(entry => {
              const [id, {active, from, to, shiftOnOtherDate, directGo, directReturn, important, shokucho}] = entry as [
                string,
                selectedUserObjectType[string],
              ]

              if (active) {
                return {
                  id: Number(id),
                  from,
                  to,
                  shiftOnOtherDate,
                  directGo,
                  directReturn,
                  important,
                  shokucho,
                }
              }
            })
            .filter(Boolean) as user[]

          const usersDelete = currentRegisterdUsers.filter(id => !usersToUpsert.find(user => user?.id === id))

          usersDelete.forEach(id => {
            transactionQueryList.push({
              model: `genbaDayShift`,
              method: 'delete',
              queryObject: {
                where: {
                  unique_userId_genbaDayId: {
                    genbaDayId: GenbaDay.id,
                    userId: id,
                  },
                },
              },
            })
          })

          usersToUpsert.forEach(user => {
            const payload = {
              genbaId: GenbaDay.genbaId,
              genbaDayId: GenbaDay.id,
              userId: user.id,
              from: user.from,
              to: user.to,
              directGo: user.directGo,
              directReturn: user.directReturn,
              important: user.important,
              shokucho: user.shokucho,
            }

            const args: Prisma.GenbaDayShiftUpsertArgs = {
              where: {
                unique_userId_genbaDayId: {
                  genbaDayId: GenbaDay.id,
                  userId: user.id,
                },
              },
              create: payload,
              update: payload,
            }
            transactionQueryList.push({
              model: `genbaDayShift`,
              method: 'upsert',
              queryObject: args,
            })
          })

          await doTransaction({transactionQueryList})
          await doStandardPrisma(`genbaDay`, `update`, {where: {id: GenbaDay.id}, data: {}})
          await chain_sohken_genbaDayUpdateChain({genbaId: GenbaDay.genbaId})
          handleClose()
        },
        {refresh: true, mutate: true}
      )
    }

    return (
      <>
        <C_Stack>
          {CsvTable({
            records: optionList.map(user => {
              const active = selectedUserObject?.[user.id]

              const {shiftsOnOtherGembaOnSameDate, DayRemark} = user

              const UserNameDisplay = () => {
                const red = isRed({shiftsOnOtherGembaOnSameDate, DayRemark})
                return (
                  <R_Stack className={`items-start gap-0.5 leading-3`}>
                    <div className={red ? 'text-red-500' : ''}>{user.name}</div>
                    <IsInShift {...{hasShift: shiftsOnOtherGembaOnSameDate.length}} />
                    <IsInKyukaTodoke {...{DayRemark}} />
                    <IsInKyuka {...{DayRemark}} />
                  </R_Stack>
                )
              }

              return {
                style: {
                  opacity: active?.active ? 1 : 0.5,
                },
                csvTableRow: [
                  {
                    label: ``,
                    cellValue: (
                      <input
                        className={`h-6 w-6`}
                        type={`checkbox`}
                        checked={!!active?.active}
                        onChange={() =>
                          setselectedUserObject(prev => {
                            return {
                              ...prev,
                              [user.id]: {
                                ...prev[user.id],
                                active: !prev[user.id]?.active,
                              },
                            }
                          })
                        }
                      />
                    ),
                    style: {width: 30, padding: 5},
                  },
                  {
                    label: `ユーザー`,
                    cellValue: <UserNameDisplay />,
                    style: {width: 120, padding: 5},
                  },
                  {
                    label: `いつから`,
                    cellValue: <Input {...{user, type: `time`, dataKey: `from`, setselectedUserObject}} />,
                    style: {width: 70, padding: 5},
                  },
                  {
                    label: `いつまで`,
                    cellValue: <Input {...{user, type: `time`, dataKey: `to`, setselectedUserObject}} />,
                    style: {width: 70, padding: 5},
                  },
                  {
                    label: `直行`,
                    cellValue: (
                      <BooleanInput
                        {...{
                          disabled: !active?.active,
                          user,
                          checked: !!active?.directGo,
                          dataKey: `directGo`,
                          setselectedUserObject,
                        }}
                      />
                    ),
                  },
                  {
                    label: `直帰`,
                    cellValue: (
                      <BooleanInput
                        {...{
                          disabled: !active?.active,
                          user,
                          checked: !!active?.directReturn,
                          dataKey: `directReturn`,
                          setselectedUserObject,
                        }}
                      />
                    ),
                  },
                  {
                    label: `強調`,
                    cellValue: (
                      <div>
                        <BooleanInput
                          {...{
                            disabled: !active?.active,
                            user,
                            checked: !!active?.important,
                            dataKey: `important`,
                            setselectedUserObject,
                          }}
                        />
                      </div>
                    ),
                  },
                  {
                    label: `職長`,
                    cellValue: (
                      <div>
                        <BooleanInput
                          {...{
                            disabled: !active?.active,
                            user,
                            checked: !!active?.shokucho,
                            dataKey: `shokucho`,
                            setselectedUserObject,
                          }}
                        />
                      </div>
                    ),
                  },
                ],
              }
            }),
          }).WithWrapper({className: `border-blue-main max-h-[50vh]  border-2`})}

          <R_Stack className={` justify-end`}>
            <Button color={`blue`} onClick={bulkUpdateUsersOnGenbaDay}>
              更新する
            </Button>
          </R_Stack>
        </C_Stack>
      </>
    )
  }

  return <Main />
}

const BooleanInput = ({disabled, user, checked, dataKey, setselectedUserObject}) => {
  return (
    <input
      {...{
        disabled,
        className: `h-6 w-6`,
        type: `checkbox`,
        checked,
        onChange: () => {
          setselectedUserObject(prev => {
            const prevValue = prev[user.id]?.[dataKey]
            const newValue = {
              ...prev,
              [user.id]: {
                ...prev[user.id],
                [dataKey]: !prevValue,
              },
            }

            return newValue
          })
        },
      }}
    />
  )
}

const Input = ({user, type, dataKey = `from`, setselectedUserObject}) => {
  const [value, setvalue] = useState(user[dataKey] ?? '')
  const timeInputProps = {
    datalist: new Array(24 * 4)
      .fill(0)
      .map((_, i) => {
        const hours = Math.floor(i / 4)
        const minutes = (i % 4) * 15
        const time = `${String(hours).padStart(2, `0`)}:${String(minutes).padStart(2, `0`)}`
        return {
          value: time,
          label: time,
        }
      })
      .filter(item => {
        return item.value >= '07:00' && item.value <= '20:00'
      }),
    step: 60 * 15,
  }

  const id = `${user.id}-${dataKey}-dataList`

  const DataList = () => {
    if (timeInputProps?.datalist) {
      return (
        <datalist id={id}>
          {timeInputProps?.datalist?.map((item: anyObject) => {
            return <option key={item.value} value={item.value} />
          })}
        </datalist>
      )
    }
    return null
  }

  const handleOnChange = (e: any) => {
    setvalue(e.target.value)
    setselectedUserObject(prev => {
      const result = {
        ...prev,
        [user.id]: {
          ...prev[user.id],
          [dataKey]: e.target.value,
          active: true,
        },
      }

      return result
    })
  }

  if (timeInputProps?.datalist) {
    return (
      <select
        {...{
          list: id,
          className: `bg-gray-200 px-2 border rounded-sm`,

          value: value,
          onChange: handleOnChange,
        }}
      >
        <option value={``}></option>
        {timeInputProps?.datalist?.map((item: anyObject) => {
          return (
            <option key={item.value} value={item.value}>
              {item.value}
            </option>
          )
        })}
      </select>
    )
  }

  return (
    <>
      <input
        {...{
          list: id,
          className: `bg-gray-200 px-2 border rounded-sm`,

          value: value,
          onChange: e => {
            handleOnChange(e)
          },
        }}
      />
      <DataList />
    </>
  )
}

const init = ({options, currentRelationalModelRecords, GenbaDay}) => {
  const optionList = options.map((user, idx) => {
    const shift = user.GenbaDayShift.find(shift => shift.genbaDayId === GenbaDay?.id)

    const shiftsOnOtherGembaOnSameDate = user.GenbaDayShift.filter(shift => {
      const isSameDate = Days.validate.isSameDate(shift.GenbaDay.date, GenbaDay.date)
      const isSameGenba = shift.GenbaDay.genbaId === GenbaDay.genbaId
      return isSameDate && !isSameGenba
    })

    const DayRemark = user.DayRemarksUser.find(remark => remark.userId === user.id)

    const shiftOnDate = currentRelationalModelRecords?.find(record => record?.User?.id === user.id)

    const {from, to, important, shokucho} = shift ?? {}

    return {
      ...user,
      active: !!shiftOnDate,
      shiftsOnOtherGembaOnSameDate,
      from,
      to,
      directGo: !!shiftOnDate?.directGo,
      directReturn: !!shiftOnDate?.directReturn,
      important,
      shokucho,
      DayRemark,
    }
  })
  // .sort((a, b) => {
  //   if (a.active) return -1
  //   if (b.active) return 1
  //   return 0
  // })

  const defaultValue = Object.fromEntries(
    optionList.map(user => {
      return [
        user.id,
        {
          active: user.active,
          from: user.from,
          to: user.to,
          directGo: user.directGo,
          directReturn: user.directReturn,
          important: user.important,
          shokucho: user.shokucho,
        },
      ]
    })
  )
  return {optionList, defaultValue}
}
