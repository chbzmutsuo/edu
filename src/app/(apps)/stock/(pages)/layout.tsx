import {PageBuilder} from '@app/(apps)/stock/(builders)/PageBuilder'
import Admin from '@components/layout/Admin/Admin'

export default async function AppLayout(props) {
  const {children} = props

  return (
    <Admin
      {...{
        AppName: 'Stock Manager',
        PagesMethod: 'stock_PAGES',
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
      }}
    >
      <div>
        {/* <Tasks /> */}
        <div>{children}</div>
      </div>
    </Admin>
  )
}
