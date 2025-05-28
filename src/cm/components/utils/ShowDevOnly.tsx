import {isDev} from 'src/cm/lib/methods/common'

const ShowDevOnly = props => {
  return <></>
  if (isDev) {
    return <div className={`t-alert-warning text-error-main max-w-[40vw] overflow-auto text-lg font-bold`}>{props.children}</div>
  } else {
    return <></>
  }
}

export default ShowDevOnly
