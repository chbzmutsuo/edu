'use client'

import React, {Fragment, useEffect, useState} from 'react'
import {colType, onFormItemBlurType} from '@cm/types/types'
import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {FormProvider, UseFormReturn} from 'react-hook-form'
import {AdditionalBasicFormPropType} from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import {useCacheSelectOptionReturnType} from 'src/cm/hooks/useCacheSelectOptions/useCacheSelectOptions'
import {cl} from 'src/cm/lib/methods/common'
import {makeFormsByColumnObj} from '@hooks/useBasicForm/lib/makeFormsByColumnObj'

import {adjustBasicFormProps} from '@hooks/useBasicForm/lib/createBasicFormProps'
import ControlGroup from '@hooks/useBasicForm/molecules/ControlGroup'
import {Card} from '@cm/shadcn-ui/components/ui/card'

export type useRegisterType = (props: {col: colType; newestRecord: any}) => {
  currentValue: any
  shownButDisabled: boolean
  Register: any
}

export type useResetValueType = (props: {col: colType; field: any}) => void

export type BasicFormType = {
  formData: any
  setformData: any
  values: any
  columns: colType[][]
  latestFormData: any
  extraFormState: any
  setextraFormState: any
  useGlobalProps: any
  Cached_Option_Props: useCacheSelectOptionReturnType
  ReactHookForm: UseFormReturn
  formId: string
  formRef: any
  // useRegister: useRegisterType
  useResetValue: useResetValueType
  onFormItemBlur?: onFormItemBlurType
} & AdditionalBasicFormPropType

const FormSection = React.memo(
  ({columns, ControlOptions, children}: {columns: colType[]; ControlOptions: any; children: React.ReactNode}) => {
    const colFormIndexGroupName = ControlOptions?.showLabel === false ? undefined : columns[0]?.form?.colIndex
    return (
      <>
        {isNaN(colFormIndexGroupName) && colFormIndexGroupName ? (
          <>
            <Card variant="outline">
              <div className={`  text-primary-main text-center text-lg font-bold `}>{colFormIndexGroupName}</div>
              {children}
            </Card>
          </>
        ) : (
          children
        )}
      </>
    )
  }
)

const BasicForm = (props: BasicFormType) => {
  const {formRef, useGlobalProps, formId, alignMode, style, wrapperClass, ControlOptions, columns} = adjustBasicFormProps(props)

  const ReactHookForm: UseFormReturn = props.ReactHookForm
  const handleFormSubmit = props.onSubmit ? ReactHookForm.handleSubmit(props.onSubmit) : undefined
  const onSubmit = async e => {
    e.preventDefault()
    const formElement = e.target as HTMLFormElement
    if (formElement?.getAttribute('id') === formId && handleFormSubmit) {
      return await handleFormSubmit(e)
    }
  }
  const {transposedRowsForForm} = makeFormsByColumnObj(columns)
  const {justifyDirection} = useJustifyDirection({transposedRowsForForm, useGlobalProps})

  const ChildComponent = () => {
    if (props.children) {
      return <div className={alignMode === `row` ? `` : 'pb-2 pt-4'}>{props.children}</div>
    }
    return <></>
  }

  return (
    <div className={`w-fit `}>
      <FormProvider {...ReactHookForm}>
        <form {...{ref: formRef, id: formId, onSubmit}}>
          <C_Stack className={`items-center`}>
            <R_Stack style={style} className={cl(` mx-auto w-full items-stretch gap-8  gap-y-24`, justifyDirection)}>
              {transposedRowsForForm.map((columns, i) => {
                return (
                  <Fragment key={i}>
                    <FormSection {...{columns, ControlOptions}}>
                      <div className={`${wrapperClass}   `}>
                        {columns.map((col: colType, formItemIndex) => {
                          const uniqueKey = `${i}-${formItemIndex}`
                          return <ControlGroup key={uniqueKey} {...{...props, col, formItemIndex}} />
                        })}
                        {alignMode === `row` && <ChildComponent />}
                      </div>
                    </FormSection>
                  </Fragment>
                )
              })}
            </R_Stack>

            {alignMode !== `row` && <ChildComponent />}
          </C_Stack>
        </form>
      </FormProvider>
    </div>
  )
}

export default BasicForm

const useJustifyDirection = ({transposedRowsForForm, useGlobalProps}) => {
  const {width, SP} = useGlobalProps

  const [justifyDirection, setjustifyDirection] = useState(`justify-center`)
  const elems = document?.querySelectorAll(`.formSec`)
  useEffect(() => {
    if (elems.length > 0) {
      const justifyDirection = transposedRowsForForm.length === 1 || SP ? `justify-center` : `justify-start`
      setjustifyDirection(justifyDirection)
    }
  }, [width, transposedRowsForForm, elems, SP])

  return {justifyDirection}
}
