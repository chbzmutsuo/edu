'use client'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {breakLines} from 'src/cm/lib/value-handler'

const Label = ({controlContextValue}) => {
  const {ReactHookForm, col, ControlOptions} = controlContextValue
  const {showLabel = true, LabelStyle} = ControlOptions ?? {}

  if (!showLabel) return <></>
  return (
    <R_Stack id={`${col.id}-label`} style={LabelStyle} className={` min-w-fit`}>
      <label
        htmlFor={col.id}
        className={` text-[15px] font-medium text-gray-500`}
        onClick={e => {
          ReactHookForm?.setFocus(col.id)
        }}
      >
        {breakLines(col.label)}
      </label>
    </R_Stack>
  )
}

export default Label
