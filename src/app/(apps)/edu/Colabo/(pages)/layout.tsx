import {Metadata} from 'next'
const AppName = 'Colabo'
export const metadata: Metadata = {title: AppName}
export default async function ColaboLayout(props) {
  const {children} = props
  return <>{children}</>
}
