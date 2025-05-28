import {VariousInputProps} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/VariousInput'
import React, {useEffect, useRef, useState} from 'react'

const MyTextarea = React.forwardRef((props: VariousInputProps, ref) => {
  const {formProps, Register, col, controlContextValue} = props

  const {onChange} = Register
  const defaultHeight = col.form?.style?.height ?? 100

  const [height, setheight] = useState(defaultHeight)

  const textAreaStyle = {
    ...controlContextValue.ControlStyle,
    height,
  }

  const textAreaRef = useRef<any>(null)
  const self = textAreaRef.current
  const {scrollHeight} = self ?? {}

  useEffect(() => {
    AdjustHeight()
  }, [self, scrollHeight])

  const AdjustHeight = () => {
    if (textAreaStyle.height <= scrollHeight) {
      setheight(scrollHeight)
    }
  }

  return (
    <div>
      <textarea
        {...{
          ...col.inputProps,
          style: {...textAreaStyle},
          className: formProps.className,
          ...Register,
          ref: e => {
            Register.ref(e)
            textAreaRef.current = e // you can still assign to ref
          },
          onChange: e => {
            AdjustHeight() //高さ緒性
            onChange(e)
          },
        }}
      />
    </div>
  )
})

export default MyTextarea
