'use client'

import {arr__insertItemAtIndex} from '@cm/class/ArrHandler/array-utils/data-operations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {TimeHandler} from '@app/(apps)/tbm/(class)/TimeHandler'

import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

import React from 'react'

import {cn} from '@shadcn/lib/utils'

const Stack = props => {
  return (
    <div {...props} className={cn(`flex flex-col items-start `, props.className)}>
      {props.children}
    </div>
  )
}

const TableWrapperClass = cn(
  'max-h-none',
  `text-center border rounded-none w-full`,
  `[&_th]:!text-[9px]`, // フォントサイズを小さく（A3対応）
  `[&_td]:!text-[8px]`, // フォントサイズを小さく（A3対応）
  `[&_th]:!bg-inherit`,
  `[&_th]:!border`,
  `[&_td]:!px-2`, // パディングを小さく
  `[&_td]:!py-0`, // 縦パディングを追加
  `[&_td]:!border`,
  `[&_td]:!align-middle`,
  `[&_td]:!leading-tight` // 行間を詰める
)

export default function TenkoPaperBody({OrderByPickUpTime, tableStyle}) {
  // A3横サイズで24-25名分を表示
  const minRowCount = Math.max(OrderByPickUpTime.length, 25)

  return (
    <div style={tableStyle}>
      {CsvTable({
        useOriginalWrapperClass: true,
        headers: [
          {
            csvTableRow: [
              {cellValue: `従業員`, colSpan: 4}, // 車番と運転者名を分離するため1列追加
              {cellValue: `乗務前点呼`, colSpan: 8},
              {cellValue: `中間点呼`, colSpan: 7},
              {cellValue: `乗務後点呼`, colSpan: 8},
              {cellValue: `備考`, colSpan: 1, rowSpan: 3, style: {width: 320}}, // 備考欄をコンパクトに
            ],
          },
          {
            csvTableRow: [
              //
              {cellValue: `勤怠`, rowSpan: 2},
              {cellValue: `運転者名`, rowSpan: 2},
              {cellValue: `車番`, rowSpan: 2}, // 車番を別列に分離
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

            // 車番の下4桁を取得（ひらがななし）
            const getVehicleNumber = (vehicleNumber: string | undefined) => {
              if (!vehicleNumber) return ''
              // 数字のみを抽出して下4桁を取得
              const numbers = vehicleNumber.replace(/\D/g, '')
              return numbers.slice(-4)
            }

            // 出発時刻の表示（24時間超え対応）
            const getDepartureTimeDisplay = () => {
              if (!date || !TbmRouteGroup?.departureTime) return null
              return (
                <>
                  <div>{formatDate(date, `M/D(ddd)`)}</div>
                  <div>{TimeHandler.formatTimeString(TbmRouteGroup.departureTime, 'display')}</div>
                </>
              )
            }

            return {
              csvTableRow: [
                //
                {label: `勤怠`, cellValue: `勤怠`, style: {width: 40}},
                {
                  label: `運転者名`,
                  cellValue: User?.name || '',
                  style: {width: 80},
                },
                {
                  label: `車番`,
                  cellValue: getVehicleNumber(TbmVehicle?.vehicleNumber),
                  style: {width: 50},
                },
                {
                  label: `出発時刻`,
                  cellValue: getDepartureTimeDisplay(),
                  style: {width: 60},
                },

                //乗務前点呼
                ...getTenkoBody(`乗務前点呼`),

                // 中間点呼
                ...getTenkoBody(`中間点呼`),

                // 乗務後点呼
                ...getTenkoBody(`乗務後点呼`),

                // 備考（コンパクト）
                {label: `備考`, cellValue: ``, style: {width: 100}},
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
          {cellValue: `有・無`, label: '①', style: {width: 50}},
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
      style: {minWidth: 60},
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
        <C_Stack className={`gap-0 `}>
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
