'use client'

import {BasicFormType} from '@hooks/useBasicForm/BaiscForm'
import {getFormProps, getStyleProps} from '@hooks/useBasicForm/hookformMethods'
import React, {Fragment, useMemo} from 'react'
import {Controller} from 'react-hook-form'
import ControlWrapper from '@components/DataLogic/TFs/MyForm/components/HookFormControl/ControlWrapper'
import {ControlContextType} from '@cm/types/form-control-type'
import {R_Stack} from '@components/styles/common-components/common-components'
import {liftUpNewValueOnChange} from '@components/DataLogic/TFs/MyForm/MyForm'
import {DH__switchColType} from '@class/DataHandler/type-converter'
import Label from '@components/DataLogic/TFs/MyForm/components/HookFormControl/util-components/Label'
import {funcOrVar} from '@lib/methods/common'
import Control from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control'
import {cn} from '@cm/shadcn-ui/utils'
import ErrorMessage from '@components/DataLogic/TFs/MyForm/components/HookFormControl/util-components/ErrorMessage'
import {Alert} from '@components/styles/common-components/Alert'

export type ControlGroupPropType = BasicFormType & {
  col
  formItemIndex
  latestFormData
}
export const ControlGroup = React.memo((props: ControlGroupPropType) => {
  const {ReactHookForm, formData, useResetValue, latestFormData, formId, ControlOptions, col, columns} = props

  const messages = ReactHookForm?.formState?.errors
  const {Register, shownButDisabled} = col

  if (!col?.id && col?.label) {
    return (
      <Fragment>
        <Alert>col.label error</Alert>
      </Fragment>
    )
  } else {
    return (
      <Controller
        name={col.id}
        control={ReactHookForm.control}
        render={({field}) => {
          const errorMessage = messages?.[col.id]?.message?.toString()

          const {id: wrapperId, flexDirection, wrapperClass, ControlStyle, isBooleanType} = getStyleProps({ControlOptions, col})

          const currentValue = props.ReactHookForm?.getValues(col.id)

          const type = DH__switchColType({type: col.type})
          const pointerClass = type === `boolean` ? ' cursor-pointer' : ''

          const required = !!col?.form?.register?.required

          col.inputProps = {
            ...col.inputProps,
            placeholder: col.inputProps?.placeholder ?? (required ? '必須です' : ''),
            required,
          }

          const controlContextValue: ControlContextType = {
            ...props,
            ControlStyle,
            ControlOptions,
            errorMessage,
            formId,
            col,
            wrapperId,
            columns,
            field,
            isBooleanType,
            currentValue,
            Register,
            formProps: getFormProps({ControlOptions, isBooleanType, Register, col, errorMessage, currentValue}),
            liftUpNewValueOnChange,
            useResetValue,
            pointerClass,
            type,
          }
          const horizontal = props.alignMode === `row`

          const MEMO_MainControlComponent = useMemo(() => {
            const shownButDisabled = ControlOptions?.shownButDisabled ?? false
            return (
              <div className={shownButDisabled ? 'pointer-events-none' : ''}>
                <R_Stack className={`w-full flex-nowrap gap-0.5 `}>
                  {/* left  */}
                  {funcOrVar(col.surroundings?.form?.left)}

                  {/* main */}
                  {col.form?.editFormat?.({...controlContextValue}) ?? <Control {...{controlContextValue}} />}

                  {/* right */}
                  {funcOrVar(col.surroundings?.form?.right)}
                </R_Stack>
              </div>
            )
          }, [col, controlContextValue])

          const MEMO_Description = useMemo(() => {
            if (ControlOptions?.showDescription !== false && col.form?.descriptionNoteAfter) {
              return (
                <div style={ControlStyle}>
                  <small style={{marginTop: 5, width: ControlStyle.width, maxWidth: ControlStyle.maxWidth}}>
                    {typeof col?.form?.descriptionNoteAfter === `function`
                      ? col?.form?.descriptionNoteAfter?.(currentValue, {...formData, ...latestFormData}, col)
                      : col.form?.descriptionNoteAfter}
                  </small>
                </div>
              )
            }
          }, [col, currentValue, formData, latestFormData, ControlOptions?.showDescription])

          const wrapperClassName = cn(wrapperClass, col.id)

          return (
            <div>
              <div {...{id: wrapperId, className: wrapperClassName}}>
                <div
                  className={cn(
                    flexDirection,
                    ` ${DH__switchColType({type: col.type}) === `boolean` ? ' cursor-pointer' : ''}  relative `
                  )}
                >
                  <div
                    style={{width: horizontal ? undefined : ControlStyle.width}}
                    className={`w-fit  gap-0 ${horizontal ? 'row-stack flex-nowrap　items-center ' : 'col-stack'}`}
                  >
                    <section className={horizontal ? 'mr-1' : `mb-2`}>
                      <div>{!col?.form?.reverseLabelTitle && <Label {...{controlContextValue}} />}</div>
                    </section>
                    <section>{MEMO_MainControlComponent}</section>
                    <section>{MEMO_Description}</section>

                    {col?.form?.reverseLabelTitle && <Label {...{controlContextValue}} />}
                  </div>
                </div>
                <ErrorMessage {...{controlContextValue}} />
              </div>
            </div>
          )

          // return (
          //   <ControlWrapper
          //     {...{
          //       errorMessage: errorMessage ?? '',
          //       formId,
          //       formItemIndex,
          //       col,
          //       formData,
          //       setformData,
          //       useResetValue,
          //       field,
          //       Register,
          //       ReactHookForm,
          //       latestFormData,
          //       ControlOptions: {...ControlOptions, shownButDisabled},
          //       extraFormState,
          //       setextraFormState,
          //       Cached_Option_Props,
          //       useGlobalProps,
          //       alignMode,
          //     }}
          //   />
          // )
        }}
      />
    )
  }
})

export default ControlGroup
