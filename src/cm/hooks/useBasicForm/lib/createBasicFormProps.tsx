import {useRegisterOrigin} from '@hooks/useBasicForm/lib/useRegisterOrigin'

export const adjustBasicFormProps = props => {
  const {alignMode = `col`, ControlOptions = {}, ...restProps} = props

  const wrapperClass = props.wrapperClass
    ? props.wrapperClass
    : alignMode === 'row'
      ? 'row-stack gap-0   items-start!   flex-wrap gap-5 gap-y-3'
      : 'col-stack  justify-center  gap-6'

  if (alignMode === 'row') {
    ControlOptions.ControlStyle = {...ControlOptions?.ControlStyle, minHeight: undefined}
    ControlOptions.direction = 'horizontal'
  }

  const {latestFormData, ReactHookForm, onFormItemBlur, formData} = restProps
  const columns = props.columns.map(cols => {
    return cols.map(col => {
      const {shownButDisabled, Register} = useRegisterOrigin({
        col,
        newestRecord: latestFormData,
        ReactHookForm,
        onFormItemBlur,
        formData,
        latestFormData,
      })
      return {...col, shownButDisabled, Register}
    })
  })

  return {
    ...restProps,
    columns,
    alignMode,
    wrapperClass,
    ControlOptions,
  }
}
