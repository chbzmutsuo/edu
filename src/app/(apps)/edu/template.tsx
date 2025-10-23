'use client'

import {Alert} from '@cm/components/styles/common-components/Alert'
import {CenterScreen} from '@cm/components/styles/common-components/common-components'
import {Metadata} from 'next'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {PageBuilder} from '@app/(apps)/edu/class/PageBuilder'
import Admin from '@cm/components/layout/Admin/Admin'

export const metadata: Metadata = {title: 'Grouping   |Colabo'}

export default function ColaboTemplate(props) {
  const {session, pathname, accessScopes} = useGlobal()
  const {schoolId, teacherId} = accessScopes().getGroupieScopes()

  const secondRootPath = pathname.split('/')[2]
  let PagesMethod, appName

  if (secondRootPath === 'Colabo') {
    PagesMethod = 'Colabo_PAGES'
    appName = 'Colabo'
  } else if (secondRootPath === 'Grouping') {
    PagesMethod = 'Grouping_PAGES'
    appName = 'Grouping'
  } else {
    PagesMethod = 'Grouping_PAGES'
    appName = ''
  }

  const excludePaths = [
    //
    '/config/school',
    '/game/main',
    'config/user',
    //

    'enter',
    'play',
  ]
  const exclude = excludePaths.some(path => pathname.includes(path))

  return (
    <Admin
      {...{
        navBarPosition: `left`,
        AppName: appName,
        PagesMethod: PagesMethod,
        additionalHeaders: [],
        PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
      }}
    >
      <div className={`relative `}>
        {exclude || teacherId ? (
          props.children
        ) : (
          <CenterScreen>
            <Alert>アカウントが設定されていません。</Alert>
          </CenterScreen>
        )}
      </div>
    </Admin>
  )
}
