'use client'
import React, {useId, useMemo} from 'react'
import {DetailPagePropType} from '@cm/types/types'
import FormHeader from 'src/cm/components/DataLogic/TFs/MyForm/FormHeader'
import {myFormDefault} from 'src/cm/constants/defaults'
import {Button} from 'src/cm/components/styles/common-components/Button'
import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import {liftUpNewValueOnChangeType} from '@cm/types/form-control-type'
import {UseFormReturn} from 'react-hook-form'
import {prismaDataExtractionQueryType} from '@components/DataLogic/TFs/Server/Conf'
import {useFormSubmit} from './hooks/useFormSubmit'

const MyForm = React.memo((props: DetailPagePropType) => {
  const prismaDataExtractionQuery = props?.prismaDataExtractionQuery as prismaDataExtractionQueryType

  // プロパティをメモ化
  const memoizedProps = useMemo(
    () => ({
      ...props,
      myForm: {...myFormDefault, ...props.myForm},
    }),
    [props]
  )

  const {mutateRecords, dataModelName, myForm, formData, setformData, columns, editType, additional} = memoizedProps
  const {session} = memoizedProps.useGlobalProps
  const formId = useId()

  // onFormItemBlurをメモ化
  const onFormItemBlur = useMemo(() => {
    return columns.flat().find(col => col?.onFormItemBlur)?.onFormItemBlur
  }, [columns])

  // BasicFormPropsをメモ化
  const {BasicForm, ReactHookForm, extraFormState, latestFormData} = useBasicFormProps({
    columns: memoizedProps?.columns,
    formData: formData ?? {},
    values: formData ?? {},
    autoApplyProps: {},
    onFormItemBlur: onFormItemBlur,
  })

  // フォーム送信フックを使用
  const {uploading, handleOnSubmit} = useFormSubmit({
    prismaDataExtractionQuery,
    myForm,
    dataModelName,
    additional,
    formData,
    columns,
    mutateRecords,
    setformData,
    editType,
  })

  // 送信ハンドラーをラップ
  const wrappedHandleOnSubmit = async () => {
    return handleOnSubmit(latestFormData, extraFormState)
  }

  const updateMode = formData?.id

  const loggerId = `myform-${dataModelName}`

  return (
    <div id={`myform-${formId}`} style={{...myForm?.style, maxHeight: undefined}} className="m-0.5">
      <section>
        <FormHeader myForm={myForm} formData={formData} />
        <div>{myForm?.customActions && myForm.customActions({...memoizedProps, ReactHookForm})}</div>
      </section>

      <section className="mx-auto w-fit">
        <BasicForm
          latestFormData={latestFormData}
          onSubmit={wrappedHandleOnSubmit}
          // className={myForm?.basicFormClassName}
          ControlOptions={myForm?.basicFormControlOptions}
        >
          <div className="sticky bottom-0 w-full pt-2 text-center">
            <Button disabled={uploading} className="w-[200px] max-w-[80vw] p-1" color={updateMode ? 'blue' : 'primary'}>
              {updateMode ? '更新' : '新規作成'}
            </Button>
          </div>
        </BasicForm>
      </section>
    </div>
  )
})

MyForm.displayName = 'MyForm'

export default MyForm

export const liftUpNewValueOnChange: liftUpNewValueOnChangeType = (props: {
  id: string
  newValue: any
  ReactHookForm: UseFormReturn
}) => {
  const {id, newValue, ReactHookForm} = props
  const before = ReactHookForm.getValues()[id]

  try {
    ReactHookForm.setValue(id, newValue)
  } catch (error) {
    console.error(error.stack) //////////
  }
}
