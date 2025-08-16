import Label from '@shadcn/ui/Organisms/form/Label'
import useFormProps from '@shadcn/ui/Organisms/form/useFormProps'
import React from 'react'
type inputProps = formPropType & {}
export default function Input(props: inputProps) {
  const {selectProps, customProps, label} = useFormProps(props)

  return (
    <div className={` relative`}>
      <Label required={customProps.required}>{label}</Label>
      {props.type === 'textarea' ? <textarea {...customProps} /> : <input {...customProps} />}
    </div>
  )
}
