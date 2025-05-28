import React from 'react'
import MyInput from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/MyInput/MyInput'

import MyFileControl from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/MyFileControl/MyFileControl'

import {ControlContextType, ControlOptionType, formPropType} from '@cm/types/form-control-type'
import MyDatepicker from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MyDatePIcker/MyDatepicker'

import MyCheckBox from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/MyCheckBox/MyCheckBox'
import MyMdEditor from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/MyMdEditor'
import {colType} from '@cm/types/types'
import MyMultipleChoice from '@components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/MyMultipleChoice'
import MyTextarea from '@components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/MyTextarea'
import MySelect from '@components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/MySelect'
import MyRating from '@components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/MyRating'

export type VariousInputProps = {
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

const VariousInput = ({controlContextValue}) => {
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

  const props: VariousInputProps = {
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

export default VariousInput
