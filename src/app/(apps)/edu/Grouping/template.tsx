'use client'
import {PageBuilder} from '@app/(apps)/edu/class/PageBuilder'

import {Alert} from '@cm/components/styles/common-components/Alert'
import {CenterScreen} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

import Redirector from '@cm/components/utils/Redirector'

import Admin from '@cm/components/layout/Admin/Admin'
const GroupingTemplate = props => {
  const {accessScopes, session, pathname, query, rootPath} = useGlobal()
  const {schoolId} = accessScopes().getGroupieScopes()

  const excludePaths = ['/config/school', '/game/main', 'config/user', 'enter']
  const exclude = excludePaths.some(path => pathname.includes(path))

  const AppName = 'Grouping'

  if (!exclude && !session?.id) {
    return <Redirector {...{redirectPath: `/login?rootPath=${rootPath}`}}></Redirector>
  }

  return (
    <div className={`relative `}>
      {session && !schoolId && !exclude ? (
        <CenterScreen>
          <Alert>学校を選択してください</Alert>
        </CenterScreen>
      ) : (
        <>{props.children}</>
      )}
    </div>
  )

  return (
    <>
      <Admin
        {...{
          navBarPosition: `left`,
          AppName: AppName,
          PagesMethod: 'Grouping_PAGES',
          additionalHeaders: [],
          PageBuilderGetter: {class: PageBuilder, getter: 'getGlobalIdSelector'},
        }}
      >
        <div className={`relative `}>
          {session && !schoolId && !exclude ? (
            <CenterScreen>
              <Alert>学校を選択してください</Alert>
            </CenterScreen>
          ) : (
            <>{props.children}</>
          )}
        </div>
      </Admin>
    </>
  )
  return <></>
}

export default GroupingTemplate
