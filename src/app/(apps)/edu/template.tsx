'use client'

import AdminClient from '@components/layout/Admin/AdminClient'
import {Alert} from '@components/styles/common-components/Alert'
import {CenterScreen} from '@components/styles/common-components/common-components'
import {Metadata} from 'next'

import useGlobal from '@hooks/globalHooks/useGlobal'
import {PageBuilder} from '@app/(apps)/edu/class/PageBuilder'

export const metadata: Metadata = {title: 'Grouping   |Colabo'}

export default function ColaboTemplate(props) {
  const {session, pathname, accessScopes} = useGlobal()
  const {schoolId} = accessScopes().getGroupieScopes()

  // const excludePaths = ['/config/school', '/game/main', 'config/user', 'enter']
  // const exclude = excludePaths.some(path => pathname.immncludes(path))

  const secondRootPath = pathname.split('/')[2]
  let PagesMethod, appName

  if (secondRootPath === 'colabo') {
    PagesMethod = 'colabo_PAGES'
    appName = 'Colabo'
  } else if (secondRootPath === 'Grouping') {
    PagesMethod = 'Grouping_PAGES'
    appName = 'Grouping'
  } else {
    PagesMethod = 'Grouping_PAGES'
    appName = ''
  }

  return (
    <AdminClient
      {...{
        navBarPosition: `left`,
        AppName: appName,
        PagesMethod: PagesMethod,
        additionalHeaders: [],
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
      }}
    >
      <div className={`relative `}>
        {session && !schoolId ? (
          <CenterScreen>
            <Alert>学校を選択してください</Alert>
          </CenterScreen>
        ) : (
          props.children
        )}
      </div>
    </AdminClient>
  )
}
