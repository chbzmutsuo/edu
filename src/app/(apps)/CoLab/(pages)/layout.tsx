import {PageBuilder} from '@app/(apps)/CoLab/(builders)/PageBuilder'
import Admin from '@components/layout/Admin/Admin'

export default async function mmm(props) {
  const {children} = props

  return (
    <Admin
      {...{
        AppName: 'テストアプリ',
        PagesMethod: 'CoLab_PAGES',
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
