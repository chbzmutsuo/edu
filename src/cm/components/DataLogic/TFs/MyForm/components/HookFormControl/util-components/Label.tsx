'use client'

import {Asterisk} from 'lucide-react'
import {R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {breakLines} from 'src/cm/lib/value-handler'

const Label = ({ReactHookForm, col, ControlOptions, required}) => {
  const {showLabel = true, LabelStyle} = ControlOptions ?? {}

  if (!showLabel) return <></>
  return (
    <R_Stack id={`${col.id}-label`} style={LabelStyle} className={` min-w-fit text-[15px] font-medium text-gray-500`}>
      <div className={` flex  gap-0.5`}>
        {required && <Asterisk className="text-red-600 w-4" />}
        <label
          htmlFor={col.id}
          onClick={e => {
            ReactHookForm?.setFocus(col.id)
          }}
        >
          {breakLines(col.label)}
        </label>
      </div>
    </R_Stack>
  )
}

export default Label
