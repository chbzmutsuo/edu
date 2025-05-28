import React from 'react'

import {VariousInputProps} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/VariousInput'
import BaseDisplay from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/BaseDisplay'
import OptionSelector from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/OptionSelector/OptionSelector'

import useInitMySelect from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/lib/useInitMySelect'
import MyRadio from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/MyRadio'

import ShadPopover from '@components/utils/shadcn/ShadPopover'
import PlaceHolder from '@components/utils/loader/PlaceHolder'

const MySelect = React.memo((props: VariousInputProps) => {
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
            open: isOptionsVisible,
            onOpenChange: setIsOptionsVisible,
            PopoverTrigger: <BaseDisplay {...{contexts}} />,
          }}
        >
          <OptionSelector {...{contexts}} />
        </ShadPopover>
      </div>
    )
  }
})

export default MySelect
