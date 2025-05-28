import {cl} from '@lib/methods/common'
import {htmlProps} from 'src/cm/components/styles/common-components/type'
export const Wrapper = (props: htmlProps) => {
  const {className, ...rest} = props
  return <div className={cl('h-fit p-0.5 sm:p-1   shadow bg-white  ', className)}>{props.children}</div>
}
export const WrapperRounded = (props: htmlProps) => {
  const {className, ...rest} = props
  return <Wrapper className={cl('rounded-sm', className)}>{props.children}</Wrapper>
}

export const Paper = (props: htmlProps) => {
  const {className, ...rest} = props
  return <div className={`t-paper ${className}`} {...rest} />
}
export const PaperLarge = (props: htmlProps) => {
  const {className, ...rest} = props
  return <div className={`t-paper m-3 p-3 ${className}`} {...rest} />
}
