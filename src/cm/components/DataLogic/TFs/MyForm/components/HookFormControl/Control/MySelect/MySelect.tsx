import React from 'react'

import {ControlProps} from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control'
import BaseDisplay from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/BaseDisplay'
import OptionSelector from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/OptionSelector/OptionSelector'

import useInitMySelect from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/lib/useInitMySelect'
import MyRadio from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/MyRadio'

import ShadPopover from '@components/utils/shadcn/ShadPopover'
import PlaceHolder from '@components/utils/loader/PlaceHolder'

const MySelect = React.memo((props: ControlProps) => {
  const {contexts} = useInitMySelect(props)
  const {currentValueToReadableStr} = contexts.MySelectContextValue

  const col = contexts.controlContextValue.col
  const {isOptionsVisible, setIsOptionsVisible} = contexts.MySelectContextValue

  if (currentValueToReadableStr === undefined) {
    return <PlaceHolder />
  }
  if (col.forSelect?.radio) {
    return <MyRadio {...props}></MyRadio>
  } else {
    return (
      <div className={`relative`}>
        <ShadPopover
          {...{
            PopoverTrigger: <BaseDisplay {...{contexts}} />,
            open: isOptionsVisible,
            onOpenChange: setIsOptionsVisible,
          }}
        >
          <OptionSelector {...{contexts}} />
        </ShadPopover>
      </div>
    )
  }
})

export default MySelect
