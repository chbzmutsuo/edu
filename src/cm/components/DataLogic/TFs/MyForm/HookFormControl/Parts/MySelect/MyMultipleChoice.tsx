import {PrismaModelNames} from '@cm/types/prisma-types'
import {multipleSelectProps} from '@cm/types/types'
import {VariousInputProps} from '@components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/VariousInput'
import {R_Stack} from '@components/styles/common-components/common-components'
import PlaceHolder from '@components/utils/loader/PlaceHolder'

import useDoStandardPrisma from '@hooks/useDoStandardPrisma'

import React, {useMemo, useState} from 'react'

const useInitOptionState = (props: VariousInputProps) => {
  const {col, currentValue: fKeyList, controlContextValue} = props

  const {models} = col.multipleSelect as multipleSelectProps

  const modelName = models.option as PrismaModelNames

  const {data: options} = useDoStandardPrisma(modelName, `findMany`, {} as never)

  return {options}
}

export default function MyMultipleChoice(props: VariousInputProps) {
  const {options} = useInitOptionState(props)

  const MemoMain = useMemo(() => <Main {...{...props, options}} />, [options])
  if (!options) return <PlaceHolder />

  return MemoMain
}

const Main = (props: VariousInputProps & {options}) => {
  const {extraFormState, setextraFormState, col, options} = props
  const [selectedValues, setselectedValues] = useState(extraFormState[col.id] ?? {})
  // const [selectedValues, setselectedValues] = useState(extraFormState[col.id] ?? {})

  const onClick = async ({op, nextActive}) => {
    let nextSelectedValues = {}
    if (nextActive) {
      nextSelectedValues = {...selectedValues, [op.id]: true}
    } else {
      nextSelectedValues = {...selectedValues, [op.id]: false}
    }

    setselectedValues(nextSelectedValues)
    setextraFormState(prev => {
      const result = {...prev, [col.id]: nextSelectedValues}
      return result
    })
  }

  return (
    <div className={` grid grid-cols-2 gap-3  w-full `}>
      {options?.map((op, i) => {
        const isActive = !!selectedValues[op.id]

        return (
          <R_Stack className={`cursor-pointer border-b !border-gray-200 flex-nowrap gap-1`} key={i}>
            <input className={`h-4`} type="checkbox" checked={isActive} onChange={() => undefined} />
            <span color={op.color ?? ''} className={` text-[14px]`} onClick={() => onClick({op, nextActive: !isActive})}>
              {op.name}
            </span>
          </R_Stack>
        )
      })}
    </div>
  )
}
