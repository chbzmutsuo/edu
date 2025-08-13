'use client'

import React, {Fragment} from 'react'
import {colType, onFormItemBlurType} from '@cm/types/types'
import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {FormProvider, UseFormReturn} from 'react-hook-form'
import {AdditionalBasicFormPropType} from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import {useCacheSelectOptionReturnType} from 'src/cm/hooks/useCacheSelectOptions/useCacheSelectOptions'

import {adjustBasicFormProps} from '@cm/hooks/useBasicForm/lib/createBasicFormProps'
import ControlGroup from '@cm/hooks/useBasicForm/molecules/ControlGroup'
import {Card} from '@cm/shadcn/ui/card'

import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {cn} from '@shadcn/lib/utils'

import {controlOffset, getUse2ColSpan} from '@cm/hooks/useBasicForm/lib/hookformMethods'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'

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
            <Card className={` px-4`}>
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
  const {formRef, formId, alignMode, style, ControlOptions, columns, ReactHookForm} = adjustBasicFormProps(props)

  const onSubmit = async e => {
    const handleFormSubmit = props.onSubmit ? ReactHookForm.handleSubmit(props.onSubmit) : undefined
    e.preventDefault()
    const formElement = e.target as HTMLFormElement
    if (formElement?.getAttribute('id') === formId && handleFormSubmit) {
      return await handleFormSubmit(e)
    }
  }

  const ChildComponent = () => {
    if (props.children) {
      return <div className={alignMode === `row` ? `` : 'pb-2 pt-4'}>{props.children}</div>
    }
    return <></>
  }

  const {transposedRowsForForm} = makeFormsByColumnObj(columns)

  const maxCols = transposedRowsForForm.length <= 1 ? {xl: 1} : {xl: 2}

  if (alignMode === `row`) {
    return (
      <FormProvider {...ReactHookForm}>
        <form {...{ref: formRef, id: formId, onSubmit}}>
          <R_Stack>
            {transposedRowsForForm.map((columns, i) => {
              return (
                <Fragment key={i}>
                  <div className={cn('row-stack gap-x-6')}>
                    {columns.map((col: colType, formItemIndex) => {
                      const uniqueKey = `${i}-${formItemIndex}`
                      return (
                        <div key={uniqueKey}>
                          <ControlGroup {...{...props, col, formItemIndex}} />
                        </div>
                      )
                    })}
                    {/* ボタン */}
                  </div>
                  <ChildComponent />
                </Fragment>
              )
            })}

            {alignMode !== `row` && <ChildComponent />}
          </R_Stack>
        </form>
      </FormProvider>
    )
  } else if (alignMode === 'col') {
    return (
      <div>
        <FormProvider {...ReactHookForm}>
          <form {...{ref: formRef, id: formId, onSubmit}}>
            <C_Stack className={`items-center gap-8 `}>
              {transposedRowsForForm.map((columns, i) => {
                return (
                  <Fragment key={i}>
                    <FormSection {...{columns, ControlOptions}}>
                      <C_Stack className={cn(`gap-8`)}>
                        {columns.map((col: colType, formItemIndex) => {
                          const use2ColSpan = getUse2ColSpan(col)
                          const uniqueKey = `${i}-${formItemIndex}`
                          const colSpan = use2ColSpan ? `md:col-span-2 ` : ` md:col-span-1`

                          return (
                            <div key={uniqueKey} className={cn(colSpan)}>
                              <ControlGroup {...{...props, col, formItemIndex}} />
                            </div>
                          )
                        })}
                        {/* ボタン */}
                      </C_Stack>
                    </FormSection>
                  </Fragment>
                )
              })}

              <ChildComponent />
            </C_Stack>
          </form>
        </FormProvider>
      </div>
    )
  } else if (alignMode === 'grid') {
    return (
      <div>
        <FormProvider {...ReactHookForm}>
          <form {...{ref: formRef, id: formId, onSubmit}}>
            <AutoGridContainer className={`items-stretch gap-4 `} maxCols={{xl: 2}}>
              {transposedRowsForForm.map((columns, i) => {
                return (
                  <Fragment key={i}>
                    <FormSection {...{columns, ControlOptions}}>
                      <div
                        className={cn(`grid grid-cols-1 md:grid-cols-2  `)}
                        style={{
                          rowGap: 30,
                          columnGap: controlOffset,
                        }}
                      >
                        {columns.map((col: colType, formItemIndex) => {
                          const use2ColSpan = getUse2ColSpan(col)
                          const uniqueKey = `${i}-${formItemIndex}`
                          const colSpan = use2ColSpan ? `md:col-span-2 ` : ` md:col-span-1`

                          return (
                            <div key={uniqueKey} className={cn(colSpan)}>
                              <ControlGroup {...{...props, col, formItemIndex}} />
                            </div>
                          )
                        })}
                        {/* ボタン */}
                      </div>
                      <ChildComponent />
                    </FormSection>
                  </Fragment>
                )
              })}

              {alignMode !== `row` && <ChildComponent />}
            </AutoGridContainer>
          </form>
        </FormProvider>
      </div>
    )
  } else if (alignMode === 'console') {
    return (
      <form {...{ref: formRef, id: formId, onSubmit}}>
        <AutoGridContainer className={`     `} maxCols={{xl: 2}}>
          {transposedRowsForForm.map((columns, i) => {
            return (
              <Fragment key={i}>
                <div className={` px-4 flex flex-col  `}>
                  {columns.map((col: colType, formItemIndex) => {
                    const use2ColSpan = getUse2ColSpan(col)
                    const uniqueKey = `${i}-${formItemIndex}`
                    const colSpan = use2ColSpan ? `md:col-span-2 ` : ` md:col-span-1`

                    return (
                      <div key={uniqueKey} className={cn(colSpan, 'mb-4')}>
                        <ControlGroup
                          {...{
                            ...props,
                            col,
                            formItemIndex,
                            alignMode: 'row',
                            ControlOptions: {
                              LabelStyle: {
                                padding: '4px 8px',
                                marginRight: '10px',
                                backgroundColor: 'rgb(240, 240, 240)',
                                width: 200,

                                fontSize: '16px',
                                // color: 'black',
                              },
                              ControlStyle: {
                                borderRadius: '0px',
                                // border: '0px solid rgb(240, 240, 240)',
                                // borderBottom: '1px solid rgb(200, 200, 200)',
                              },
                            },
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </Fragment>
            )
          })}
        </AutoGridContainer>
        <ChildComponent />
      </form>
    )
  }
}

export default BasicForm

// const useJustifyDirection = ({transposedRowsForForm, useGlobalProps}) => {
//   const {width, SP} = useGlobalProps

//   const [justifyDirection, setjustifyDirection] = useState(`justify-center`)
//   const elems = document?.querySelectorAll(`.formSec`)
//   useEffect(() => {
//     if (elems.length > 0) {
//       const justifyDirection = transposedRowsForForm.length === 1 || SP ? `justify-center` : `justify-start`
//       setjustifyDirection(justifyDirection)
//     }
//   }, [width, transposedRowsForForm, elems, SP])

//   return {justifyDirection}
// }

//カラム作成
const makeFormsByColumnObj = (columns: any) => {
  const validColumnsForEditForm: colType[] = columns.flat().filter(col => col.form && col?.form?.hidden !== true)
  const formsByColumnObj: any = {}

  validColumnsForEditForm.sort((x: colType, y: colType) => {
    return Number(x.originalColIdx) - Number(y.originalColIdx)
  })

  validColumnsForEditForm.forEach((col: colType) => {
    const colIndex = col?.form?.colIndex ?? 0
    obj__initializeProperty(formsByColumnObj, colIndex, [])
    formsByColumnObj[colIndex].push(col)
  })

  const transposedRowsForForm: colType[][] = Object.keys(formsByColumnObj).map(key => {
    return formsByColumnObj[key]
  })
  const colIndexes = Object.keys(formsByColumnObj)

  return {transposedRowsForForm, colIndexes}
}
