'use client'

import {arr__insertItemAtIndex} from '@cm/class/ArrHandler/array-utils/data-operations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

import React from 'react'

import {twMerge} from 'tailwind-merge'

export default function TenkoPaperBody({OrderByPickUpTime, tableStyle}) {
  const minRowCount = Math.max(OrderByPickUpTime.length, 40)

  return (
    <div style={tableStyle}>
      {CsvTable({
        // headerRecords: [
        //   {
        //     csvTableRow: [
        //       {cellValue: `従業員`, colSpan: 4},
        //       {cellValue: `乗務前点呼`, colSpan: 8},
        //       {cellValue: `中間点呼`, colSpan: 7},
        //       {cellValue: `乗務後点呼`, colSpan: 8},
        //       {cellValue: `備考`, colSpan: 1},
        //     ],
        //   },
        //   {
        //     csvTableRow: [
        //       //
        //       {cellValue: `勤怠`, rowSpan: 2},
        //       {cellValue: `氏名`, rowSpan: 2},
        //       {cellValue: `車両`, rowSpan: 2},
        //       {cellValue: `出発時刻`, rowSpan: 2},

        //       ...getTenkoHeaders(`乗務前点呼`),
        //       ...getTenkoHeaders(`中間点呼`),
        //       ...getTenkoHeaders(`乗務後点呼`),
        //     ],
        //   },
        //   {
        //     csvTableRow: [
        //       // {cellValue: ``},
        //       // {cellValue: ``},
        //       // {cellValue: ``},
        //       // {cellValue: ``},
        //       ...getTenkoHeader2(`乗務前点呼`),
        //       ...getTenkoHeader2(`中間点呼`),
        //       ...getTenkoHeader2(`乗務後点呼`),
        //     ],
        //   },
        // ].map(data => {
        //   return {
        //     csvTableRow: data.csvTableRow.map(col => {
        //       return {
        //         ...col,
        //         cellValue: <div className={` font-bold`}>{col.cellValue}</div>,
        //       }
        //     }),
        //   }
        // }),

        records: [
          ...new Array(minRowCount).fill(0).map((_, i) => {
            const data = OrderByPickUpTime[i]
            const {User, TbmVehicle, TbmRouteGroup, date} = data ?? {}

            const theDate = date + ` ` + TbmRouteGroup?.pickupTime
            if (date) {
              console.log(new Date(theDate))
            }
            return {
              className: `h-6`,
              csvTableRow: [
                //
                {label: `勤怠`, cellValue: `勤怠`},
                {label: `氏名`, cellValue: User?.name},
                {label: `車両`, cellValue: TbmVehicle?.vehicleNumber},
                {
                  label: `出発時刻`,
                  cellValue: date && (
                    <>
                      <div>{formatDate(date, `M/D(ddd)`)}</div>
                      <div>{TbmRouteGroup?.pickupTime}</div>
                    </>
                  ),
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
        className: twMerge(
          'max-h-none',
          `text-center border  rounded-none w-full`,
          `[&_th]:!text-[11px] `,
          `[&_td]:!text-[11px]`,

          `[&_th]:!bg-inherit`,
          `[&_th]:!border`,

          `[&_td]:!px-4 `,
          `[&_td]:!border`,
          `[&_td]:!p-0`
        ),
        style: {
          ...tableStyle,
        },
      })}
    </div>
  )
}

// const getTenkoHeaders = (sectionName: `乗務前点呼` | `中間点呼` | `乗務後点呼`) => {
//   let cols = [
//     {cellValue: `点呼時刻`, rowSpan: 2},
//     {cellValue: `点呼方法`, rowSpan: 2},
//     {cellValue: `アルコール検知器使用の有無`, rowSpan: 2, style: {width: 50}},
//     {cellValue: `確認事項`, colSpan: sectionName === `乗務前点呼` ? 4 : 3, rowSpan: 1},
//     {cellValue: `点呼執行者印`, rowSpan: 2, style: {width: 50}},
//   ]

//   if (sectionName === `乗務後点呼`) {
//     cols = arr__insertItemAtIndex(cols, 4, {cellValue: `交代運転者に足しする通知・その他`, rowSpan: 2})
//   }

//   return cols
// }

// const getTenkoHeader2 = (sectionName: `乗務前点呼` | `中間点呼` | `乗務後点呼`) => {
//   const kakuninCols =
//     sectionName === `乗務前点呼`
//       ? [
//           //
//           {cellValue: `①`},
//           {cellValue: `②`},
//           {cellValue: `③`},
//           {cellValue: `④`},
//         ]
//       : [
//           //
//           {cellValue: `①`},
//           {cellValue: `②`},
//           {cellValue: `③`},
//         ]

//   return kakuninCols
// }

const getTenkoBody = (sectionName: `乗務前点呼` | `中間点呼` | `乗務後点呼`) => {
  const kakuninCols =
    sectionName === `乗務前点呼`
      ? [
          //
          {cellValue: `有・無`},
          {cellValue: ``},
          {cellValue: ``},
          {cellValue: ``},
        ]
      : [{cellValue: ``}, {cellValue: ``}, {cellValue: ``}]

  let cols = [
    {
      cellValue: (
        <>
          <div>
            <R_Stack className={` gap-4 justify-center`}>
              <span>月 </span>
              <span>日</span>
            </R_Stack>
            <div>:</div>
          </div>
        </>
      ),
    },
    {
      cellValue: (
        <C_Stack className={`gap-0.5`}>
          <div>対面</div>
          <div>TEL</div>
          <div>
            <span>（</span>
            <span className={`ml-5`}>）</span>
          </div>
        </C_Stack>
      ),
    },
    {cellValue: `有 ・ 無`},

    ...kakuninCols,
    {cellValue: ``},
  ]

  if (sectionName === `乗務後点呼`) {
    cols = arr__insertItemAtIndex(cols, 6, {
      cellValue: ``,
      style: {width: 150},
    })
  }

  return cols
}
