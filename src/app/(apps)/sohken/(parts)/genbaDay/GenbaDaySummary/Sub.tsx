'use client'

import {DistributionListByModel} from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/DistributionListByModel'
import {Circle, R_Stack} from '@components/styles/common-components/common-components'
import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import React from 'react'

export default function Sub({records, GenbaDay, editable, commonProps, PC, allShiftBetweenDays}) {
  const {GenbaDayShift} = GenbaDay

  const ArrayData = GenbaDayShift?.map((v, i) => {
    const {User, from, to, important, directGo, directReturn, shokucho, userId} = v

    const shiftsOnOtherGembaOnSameDate = allShiftBetweenDays
      .filter(shift => {
        return (
          shift.userId === User.id &&
          Days.validate.isSameDate(shift.GenbaDay.date, GenbaDay.date) &&
          shift.GenbaDay.genbaId !== GenbaDay.genbaId &&
          shift.from
        )
      })
      .sort((a, b) => {
        const aTime = new Date(formatDate(a.GenbaDay.date) + ' ' + a.from)
        const bTime = new Date(formatDate(b.GenbaDay.date) + ' ' + b.from)
        return aTime.getTime() - bTime.getTime()
      })

    const cardDate = new Date(formatDate(GenbaDay.date) + ' ' + to)
    const nextShift =
      to &&
      shiftsOnOtherGembaOnSameDate.find(shift => {
        const date2 = new Date(formatDate(shift.GenbaDay.date) + ' ' + shift.from)

        return cardDate <= date2 && shift.from
      })

    const currentShiftDisplay = (
      <R_Stack className={`gap-[1px]`}>
        {/* <small className={`mr-0.5`}>{i + 1}</small> */}

        {/* {v.id} */}
        {directGo && <small>{'直行)'}</small>}
        {directReturn && <small>{'直帰)'}</small>}

        <span className={`  font-extrabold text-blue-500`}>
          {/* {isDev && <div className={``}>{User?.id}</div>} */}
          {User?.name}:{' '}
        </span>

        {from && (
          <>
            <span>{from}</span>
          </>
        )}
        {(from || to) && <small>~</small>}
        {to && (
          <>
            <span>{to}</span>
          </>
        )}
      </R_Stack>
    )

    const nextShiftIndex = nextShift
      ? records?.findIndex(genbaday => {
          return genbaday.id === nextShift?.genbaDayId
        })
      : null

    const nextShiftDisplay =
      nextShift && nextShiftIndex ? (
        <R_Stack className={`gap-[1px]`}>
          <span>➡︎</span>
          <Circle width={18}>{nextShiftIndex + 1}</Circle>
          {nextShift?.from && (
            <>
              <span>{nextShift?.from}</span>
            </>
          )}

          {(nextShift?.from || nextShift?.to) && <small>~</small>}

          {nextShift?.to && (
            <>
              <span>{nextShift?.to}</span>
            </>
          )}
        </R_Stack>
      ) : null

    return {
      ...v,
      name: (
        <div
          className={[important ? ' rounded-sm bg-orange-300  px-1' : shokucho ? ' rounded-sm bg-green-300  px-1' : ' '].join(
            ` `
          )}
        >
          <div>{currentShiftDisplay}</div>
          <div>{nextShiftDisplay}</div>
        </div>
      ),
    }
  }).sort((a, b) => {
    return a.User.sortOrder - b.User.sortOrder
  })
  const {GenbaDaySoukenCar} = GenbaDay

  return (
    <div className={`items-stretch ${PC ? 'row-stack' : 'col-stack mx-auto w-fit items-center'} `}>
      <DistributionListByModel
        {...{
          editable,
          ...commonProps,
          baseModelName: `user`,
          RelationalModel: `genbaDayShift`,
          iconBtn: {text: `人員配置`, color: `yellow`},
          ArrayData,
        }}
      />
      <DistributionListByModel
        {...{
          editable,
          ...commonProps,
          baseModelName: `sohkenCar`,
          RelationalModel: `genbaDaySoukenCar`,
          iconBtn: {
            text: <>車両</>,
            color: `blue`,
          },
          ArrayData: GenbaDaySoukenCar.map(v => ({...v, name: v?.SohkenCar?.name})),
        }}
      />
    </div>
  )
}
