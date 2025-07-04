import React from 'react'
import {R_Stack} from '@components/styles/common-components/common-components'
import {funcOrVar} from '@lib/methods/common'
import Control from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control'

export default function LeftControlRight({col, controlContextValue, shownButDisabled}) {
  return (
    <div className={shownButDisabled ? 'pointer-events-none' : ''}>
      <R_Stack className={`w-full flex-nowrap gap-0.5 `}>
        {funcOrVar(col.surroundings?.form?.left)}

        {/* main */}
        {col.form?.editFormat?.({...controlContextValue}) ?? <Control {...{controlContextValue}} />}

        {/* right */}
        {funcOrVar(col.surroundings?.form?.right)}
      </R_Stack>
    </div>
  )
}
