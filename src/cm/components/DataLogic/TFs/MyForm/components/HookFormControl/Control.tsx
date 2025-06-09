import React from 'react'
import MyInput from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyInput/MyInput'

import MyFileControl from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyFileControl/MyFileControl'

import {ControlContextType, ControlOptionType, formPropType} from '@cm/types/form-control-type'

import dynamic from 'next/dynamic'
import {colType} from '@cm/types/types'

const MyDatepicker = dynamic(
  () => import('@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyDatePIcker/MyDatepicker')
)
const MyCheckBox = dynamic(
  () => import('@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyCheckBox/MyCheckBox')
)
const MyMdEditor = dynamic(() => import('@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyMdEditor'))
const MyMultipleChoice = dynamic(
  () => import('@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/MyMultipleChoice')
)
const MyTextarea = dynamic(() => import('@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyTextarea'))
const MySelect = dynamic(() => import('@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MySelect/MySelect'))
const MyRating = dynamic(() => import('@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyRating'))

export type ControlProps = {
  field: string
  latestFormData: any
  ReactHookForm: any
  Register: any
  col: colType
  currentValue: any
  formProps: formPropType
  shownButDisabled: boolean
  extraFormState: any
  setextraFormState: any
  controlContextValue: ControlContextType
  ControlOptions: ControlOptionType
}

const Control = ({controlContextValue}) => {
  const {
    ReactHookForm,
    col,
    Register,
    ControlOptions,
    latestFormData,
    extraFormState,
    setextraFormState,
    currentValue,
    field,
    formProps,
  } = controlContextValue

  const shownButDisabled = ControlOptions?.shownButDisabled ?? false

  col.type = col.inputTypeAs ?? col.type ?? 'text'
  const {type} = col

  const props: ControlProps = {
    field,
    latestFormData,
    ReactHookForm,
    Register,
    col,
    currentValue,
    formProps,
    shownButDisabled,
    extraFormState,
    setextraFormState,
    controlContextValue,
    ControlOptions,
  }

  if (type === 'slate') {
    return <MyMdEditor {...props} />
  }
  if (type === 'textarea') {
    return <MyTextarea {...props} />
  }

  if (type === 'boolean' || type === 'confirm') {
    return <MyCheckBox {...props} />
  }

  if (type === 'date' || type === 'month' || type === 'datetime' || type === 'year') {
    return <MyDatepicker {...props} />
    return <></>
  }

  if (col.multipleSelect) {
    return <MyMultipleChoice {...props}></MyMultipleChoice>
  } else if (col.forSelect) {
    return <MySelect {...{...props}} />
  }
  if (type === 'rating') {
    return <MyRating {...props} />
  }

  if (type === 'file') {
    return <MyFileControl {...props} />
  }

  return <MyInput {...props} />
}

export default Control
