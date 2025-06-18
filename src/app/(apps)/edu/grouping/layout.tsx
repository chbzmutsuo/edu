import {Metadata} from 'next'

const AppName = 'Grouping'
export const metadata: Metadata = {title: AppName}
export default async function Groupie_Admin_Layout(props) {
  const {children} = props
  return <>{children}</>
}
