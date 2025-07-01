import React, {createContext, useMemo} from 'react'

import ErrorMessage from '@components/DataLogic/TFs/MyForm/components/HookFormControl/util-components/ErrorMessage'
import {cl, funcOrVar} from 'src/cm/lib/methods/common'
import Label from '@components/DataLogic/TFs/MyForm/components/HookFormControl/util-components/Label'
import Control from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control'

import {ControlContextType, ControlWrapperPropType} from '@cm/types/form-control-type'
import {getFormProps, getStyleProps} from 'src/cm/hooks/useBasicForm/hookformMethods'
import {liftUpNewValueOnChange} from 'src/cm/components/DataLogic/TFs/MyForm/MyForm'

import {R_Stack} from '@components/styles/common-components/common-components'
import {DH__switchColType} from '@class/DataHandler/type-converter'

export const ControlContext = createContext({})

const ControlWrapper = React.memo((props: ControlWrapperPropType) => {
  const {
    // wrapperId,
    // flexDirection,
    // wrapperClass,
    // ControlStyle,
    // isBooleanType,
    formId,
    col,
    Register,
    field,
    columns,
    useResetValue,
    ControlOptions,
    latestFormData,
    formData,
    errorMessage,
  } = props

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

  const LabelComponent = () => {
    return (
      <R_Stack className={`flex-nowrap justify-between gap-0 `}>
        <>{!col?.form?.reverseLabelTitle && <Label {...{controlContextValue}} />}</>
      </R_Stack>
    )
  }

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

  const wrapperClassName = cl(wrapperClass, col.id)

  return (
    <>
      <div {...{id: wrapperId, className: wrapperClassName}}>
        <div
          className={cl(
            flexDirection,
            ` ${DH__switchColType({type: col.type}) === `boolean` ? ' cursor-pointer' : ''}  relative `
          )}
        >
          <div
            style={{width: horizontal ? undefined : ControlStyle.width}}
            className={`w-fit  gap-0 ${horizontal ? 'row-stack flex-nowrap　items-center ' : 'col-stack'}`}
          >
            <section className={horizontal ? 'mr-1' : `mb-2`}>
              <R_Stack className={` justify-between gap-0.5 `}>
                {/* {!horizontal && <ResetBtnComponent />} */}
                <LabelComponent />
                {/* {horizontal && <ResetBtnComponent />} */}
              </R_Stack>
            </section>
            <section>{MEMO_MainControlComponent}</section>
            <section>{MEMO_Description}</section>

            {col?.form?.reverseLabelTitle && <Label {...{controlContextValue}} />}
          </div>
        </div>
        <ErrorMessage {...{controlContextValue}} />
      </div>
    </>
  )
})
export default ControlWrapper

//

//

//
