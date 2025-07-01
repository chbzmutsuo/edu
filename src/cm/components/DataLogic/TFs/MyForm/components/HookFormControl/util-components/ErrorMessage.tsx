import {ControlContextType} from '@cm/types/form-control-type'

const ErrorMessage = ({controlContextValue}) => {
  const {ReactHookForm, col, ControlOptions} = controlContextValue as ControlContextType
  const showErrorMessage = ControlOptions?.showErrorMessage ?? true

  const message = ReactHookForm?.formState?.errors[col.id]?.message?.toString()

  if (message && showErrorMessage) {
    return (
      <div className={`min-w-[50px]  text-end`}>
        <small className="text-error-main  text-xs ">{message}</small>
      </div>
    )
  } else return <></>
}

export default ErrorMessage
