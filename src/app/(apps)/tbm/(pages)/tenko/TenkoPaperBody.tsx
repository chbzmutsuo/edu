'use client'

import {arr__insertItemAtIndex} from '@cm/class/ArrHandler/array-utils/data-operations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

import React from 'react'

import {cn} from '@shadcn/lib/utils'
import {twMerge} from 'tailwind-merge'

const Stack = props => {
  return (
    <div {...props} className={cn(`flex flex-col items-start `, props.className)}>
      {props.children}
    </div>
  )
}

const TableWrapperClass = cn(
  'max-h-none',
  `text-center border  rounded-none w-full`,
  `[&_th]:!text-[11px] `,
  `[&_td]:!text-[11px]`,
  `[&_th]:!bg-inherit`,
  `[&_th]:!border`,
  `[&_td]:!px-4 `,
  `[&_td]:!border`,
  `[&_td]:!align-middle`,
  `[&_td]:!p-0`
)

export default function TenkoPaperBody({OrderByPickUpTime, tableStyle}) {
  const minRowCount = Math.max(OrderByPickUpTime.length, 40)

  return (
    <div
      style={tableStyle}
      className={
        cn()
        //
      }
    >
      {CsvTable({
        useOriginalWrapperClass: true,
        headers: [
          {
            csvTableRow: [
              {cellValue: `従業員`, colSpan: 3},
              {cellValue: `乗務前点呼`, colSpan: 8},
              {cellValue: `中間点呼`, colSpan: 7},
              {cellValue: `乗務後点呼`, colSpan: 8},
              {cellValue: `備考`, colSpan: 1, rowSpan: 3, style: {width: 320}},
            ],
          },
          {
            csvTableRow: [
              //
              {cellValue: `勤怠`, rowSpan: 2},
              {cellValue: `車両`, rowSpan: 2},
              {cellValue: `出発時刻`, rowSpan: 2},

              ...getTenkoHeaders(`乗務前点呼`),
              ...getTenkoHeaders(`中間点呼`),
              ...getTenkoHeaders(`乗務後点呼`),
            ],
          },
          {
            csvTableRow: [
              //
              ...getTenkoHeader2(`乗務前点呼`),
              ...getTenkoHeader2(`中間点呼`),
              ...getTenkoHeader2(`乗務後点呼`),
            ],
          },
        ],

        records: [
          ...new Array(minRowCount).fill(0).map((_, i) => {
            const data = OrderByPickUpTime[i]
            const {User, TbmVehicle, TbmRouteGroup, date} = data ?? {}

            const theDate = date + ` ` + TbmRouteGroup?.pickupTime
            if (date) {
              console.log(new Date(theDate))
            }
            return {
              csvTableRow: [
                //
                {label: `勤怠`, cellValue: `勤怠`},
                {
                  label: `氏名`,
                  cellValue: (
                    <Stack className={` items-start p-1`}>
                      <div>{User?.name}</div>
                      <small>{TbmVehicle?.vehicleNumber}</small>
                    </Stack>
                  ),
                  width: 100,
                },

                {
                  label: `出発時刻`,
                  cellValue: date && (
                    <>
                      <div>{formatDate(date, `M/D(ddd)`)}</div>
                      <div>{TbmRouteGroup?.pickupTime}</div>
                    </>
                  ),
                  width: 50,
                },

                //乗務前点呼
                ...getTenkoBody(`乗務前点呼`),

                // 中間点呼
                ...getTenkoBody(`中間点呼`),

                // 乗務後点呼
                ...getTenkoBody(`乗務後点呼`),

                // 備考
                {label: `備考`, cellValue: ``},
              ],
            }
          }),
        ],
      }).WithWrapper({
        className: cn(TableWrapperClass, '[&_th]:!bg-gray-200'),
        style: {...tableStyle},
      })}
    </div>
  )
}

const getTenkoHeaders = (sectionName: `乗務前点呼` | `中間点呼` | `乗務後点呼`) => {
  let cols = [
    {cellValue: `点呼時刻`, rowSpan: 2},
    {cellValue: `点呼方法`, rowSpan: 2},
    {cellValue: `アルコール検知器使用の有無`, rowSpan: 2, style: {width: 50}},
    {cellValue: `確認事項`, colSpan: sectionName === `乗務前点呼` ? 4 : 3, rowSpan: 1},
    {cellValue: `点呼執行者印`, rowSpan: 2, style: {width: 50}},
  ]

  if (sectionName === `乗務後点呼`) {
    cols = arr__insertItemAtIndex(cols, 4, {cellValue: `交代運転者に足しする通知・その他`, rowSpan: 2})
  }

  return cols
}

const getTenkoHeader2 = (sectionName: `乗務前点呼` | `中間点呼` | `乗務後点呼`) => {
  const kakuninCols =
    sectionName === `乗務前点呼`
      ? [
          //
          {cellValue: `①`},
          {cellValue: `②`},
          {cellValue: `③`},
          {cellValue: `④`},
        ]
      : [
          //
          {cellValue: `①`},
          {cellValue: `②`},
          {cellValue: `③`},
        ]

  return kakuninCols
}

const getTenkoBody = (sectionName: `乗務前点呼` | `中間点呼` | `乗務後点呼`) => {
  const kakuninCols =
    sectionName === `乗務前点呼`
      ? [
          //
          {cellValue: `有・無`, label: '①', style: {width: 40}},
          {cellValue: ``, label: '②', style: {width: 30}},
          {cellValue: ``, label: '③', style: {width: 30}},
          {cellValue: ``, label: '④', style: {width: 30}},
        ]
      : [
          {cellValue: ``, label: '①', style: {width: 30}},
          {cellValue: ``, label: '②', style: {width: 30}},
          {cellValue: ``, label: '③', style: {width: 30}},
        ]

  let cols = [
    {
      style: {width: 50},
      label: `点呼時刻`,
      cellValue: (
        <>
          <div className={`p-1`}>
            <div className={`h-4`}>
              {sectionName !== '乗務前点呼' && (
                <R_Stack className={` gap-4 justify-end`}>
                  <span>月 </span>
                  <span>日</span>
                </R_Stack>
              )}
            </div>

            <div>:</div>
          </div>
        </>
      ),
    },
    {
      label: `点呼方法`,
      style: {width: 50},
      cellValue: (
        <C_Stack className={`gap-0.5 py-0.5`}>
          <div>対面</div>
          <div>TEL</div>
          <div>
            <span>（</span>
            <span className={`ml-5`}>）</span>
          </div>
        </C_Stack>
      ),
    },
    {cellValue: `有 ・ 無`, label: `アルコール検知機器の有無`, style: {width: 60}},

    ...kakuninCols,
    {cellValue: ``, label: `点呼執行者印`, style: {width: 60}},
  ]

  if (sectionName === `乗務後点呼`) {
    cols = arr__insertItemAtIndex(cols, 6, {
      cellValue: ``,
      label: '交代運転者に対する通知・その他',
      style: {width: 150},
    }) as any
  }

  return cols
}
