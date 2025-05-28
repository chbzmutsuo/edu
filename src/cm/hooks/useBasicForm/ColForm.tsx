'use client'

import {BasicFormType} from '@hooks/useBasicForm/BaiscForm'
import {getStyleProps} from '@hooks/useBasicForm/hookformMethods'
import React, {Fragment} from 'react'

import {Controller} from 'react-hook-form'

import Control from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/Control/Control'

export type ColFormPropType = BasicFormType & {
  col
  formItemIndex
  latestFormData
}
export const ColForm = React.memo((props: ColFormPropType) => {
  const {
    ReactHookForm,
    formData,
    setformData,
    extraFormState,
    setextraFormState,
    Cached_Option_Props,
    useGlobalProps,
    // useRegister,
    useResetValue,
    latestFormData,
    formId,
    alignMode,
    ControlOptions,
    col,
    formItemIndex,
  } = props

  const messages = ReactHookForm?.formState?.errors
  const {Register, shownButDisabled} = col

  if (!col?.id && col?.label) {
    return <Fragment>{col?.label}</Fragment>
  } else {
    return (
      <Controller
        name={col.id}
        control={ReactHookForm.control}
        render={({field}) => {
          const {id: wrapperId, flexDirection, wrapperClass, ControlStyle, isBooleanType} = getStyleProps({ControlOptions, col})

          const message = messages?.[col.id]?.message?.toString()
          return (
            <div style={{...ControlStyle, padding: '0px 2px', width: `fit-content`}}>
              <Control
                {...{
                  errorMessage: message ?? '',
                  wrapperId,
                  flexDirection,
                  wrapperClass,
                  ControlStyle: {
                    ...ControlStyle,
                    width: isNaN(ControlStyle.width) ? ControlStyle.width : ControlStyle.width - 20,
                    maxWidth: isNaN(ControlStyle.width) ? ControlStyle.maxWidth : ControlStyle.width - 20,
                    overflow: `hidden`,
                  },
                  isBooleanType,
                  formId,
                  formItemIndex,
                  col,
                  formData,
                  setformData,
                  useResetValue,
                  field,
                  Register,
                  ReactHookForm,
                  latestFormData,
                  ControlOptions: {...ControlOptions, shownButDisabled},
                  extraFormState,
                  setextraFormState,
                  Cached_Option_Props,
                  useGlobalProps,
                  alignMode,
                }}
              />
            </div>
          )
        }}
      />
    )
  }
})

export default ColForm
