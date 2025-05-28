import {R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {QuestionMarkCircleIcon} from '@heroicons/react/20/solid'
import React from 'react'

import MyPopover from './MyPopover'

export default function HintPopover({
  icon = <QuestionMarkCircleIcon className={` onHover text-sub-main  h-6 w-6`} />,
  label,
  children,
  popoverClass = `t-alert-sub max-w-sm text-sm p-2 font-normal`,
}) {
  const button = (
    <R_Stack className={`row-stack gap-0.5`}>
      <div>{icon}</div>
      <div>{label}</div>
    </R_Stack>
  )
  return (
    <MyPopover {...{button: button}}>
      <div className={popoverClass}>{children}</div>
    </MyPopover>
  )
}
