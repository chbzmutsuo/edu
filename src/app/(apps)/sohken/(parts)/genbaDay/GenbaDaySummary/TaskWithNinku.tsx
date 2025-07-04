'use client'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {PlusCircleIcon} from 'lucide-react'
import React from 'react'
import {GetNinkuList} from 'src/non-common/(chains)/getGenbaScheduleStatus/getNinkuList'
import {formatDate} from '@class/Days/date-utils/formatters'
import {Alert} from '@components/styles/common-components/Alert'
import {IconBtn} from '@components/styles/common-components/IconBtn'
import {Circle} from 'lucide-react'

export const TaskWithNinku = ({GenbaDay, editable, setGenbaDayCardEditModal, GenbaDayTaskMidTable}) => {
  const {result, overShift} = GetNinkuList({GenbaDay, theDay: GenbaDay.date, GenbaDayTaskMidTable})
  const handleOnClick = ({taskMidTable = undefined}) => {
    if (editable) {
      setGenbaDayCardEditModal({
        taskMidTable,
        genbaId: GenbaDay.Genba.id,
        genbaDayId: GenbaDay.id,
      })
    }
  }

  return (
    <R_Stack className={`flex-nowrap  gap-1 `}>
      {editable && (
        <button onClick={() => handleOnClick({})}>
          <PlusCircleIcon className={`w-6`} />
        </button>
      )}

      <C_Stack className={`w-full  `}>
        {GenbaDayTaskMidTable.length === 0 && (
          <Alert color="red" className={` border-4!`}>
            タスク未設定
          </Alert>
        )}
        {GenbaDayTaskMidTable.sort((a, b) => {
          return a.GenbaTask.sortOrder - b.GenbaTask.sortOrder
        }).map((d, i) => {
          const {name, from, to, requiredNinku, color} = d.GenbaTask

          const filled = result[name] === requiredNinku

          return (
            <R_Stack
              className={` gap-2`}
              key={i}
              {...{
                onClick: () => handleOnClick({taskMidTable: d}),
              }}
            >
              <C_Stack className={`items-center gap-0`}>
                <IconBtn
                  {...{
                    color,
                    className: `!text-black text-sm px-1`,
                  }}
                >
                  {name}
                </IconBtn>
              </C_Stack>
              <div>
                <small>{formatDate(from, 'M/D')}~</small>
                <small>{formatDate(to, 'M/D')}</small>
              </div>
              <R_Stack className={` gap-0.5`}>
                <span>#</span>
                <strong>{requiredNinku}</strong>
                <span>-</span>
                <span>{result[name]}</span>

                {filled && <Circle className={`w-5 h-5 bg-green-500  rounded-full border-2 border-white`} />}
              </R_Stack>
            </R_Stack>
          )
        })}
      </C_Stack>
      <div className={` min-w-[50px]`}>
        {overShift > 0 && (
          <Alert className={`w-fit  p-1`} color="red">
            超({overShift})
          </Alert>
        )}
      </div>
    </R_Stack>
  )
}
