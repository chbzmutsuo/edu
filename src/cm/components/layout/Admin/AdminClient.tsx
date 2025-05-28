'use client'
import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'
import Redirector from 'src/cm/components/utils/Redirector'
import React, {useMemo} from 'react'
import {HREF} from 'src/cm/lib/methods/urls'
import {MetaData} from '@components/layout/MetaData'
import {adminProps} from '@components/layout/Admin/Admin'
import {obj__cleanObject} from '@class/ObjHandler/transformers'

// 分離したフックとコンポーネント
import {useAdminContext} from './hooks/useAdminContext'
import {useAccessValidation} from './hooks/useAccessValidation'
import {AdminLayout} from './components/AdminLayout'

const AdminClient = React.memo((props: adminProps) => {
  const useGlobalProps = useGlobal()
  const {AppName, children} = props
  const {pathname, query} = useGlobalProps

  // カスタムフックを使用してロジックを分離
  const {adminContext, menuContext} = useAdminContext(props, useGlobalProps)
  const {isValid, redirectPath, needsRedirect} = useAccessValidation(useGlobalProps)

  // アクセス検証によるリダイレクト
  if (!isValid && needsRedirect && redirectPath) {
    return <Redirector redirectPath={redirectPath} />
  }

  // 不要なクエリパラメータのクリーンアップ
  const cleanedQuery = useMemo(() => obj__cleanObject({...query}), [query])
  const shouldRedirectForQuery = useMemo(() => {
    return Object.keys(query).some(key => !cleanedQuery[key])
  }, [query, cleanedQuery])

  if (shouldRedirectForQuery) {
    console.warn('Redirected because of undefined query parameter')
    const redirectPath = HREF(pathname, cleanedQuery, query)
    return <Redirector redirectPath={redirectPath} />
  }

  return (
    <div>
      <MetaData pathItemObject={adminContext.pathItemObject} AppName={AppName} />
      <AdminLayout adminContext={adminContext} menuContext={menuContext} useGlobalProps={useGlobalProps}>
        {children}
      </AdminLayout>
    </div>
  )
})

AdminClient.displayName = 'AdminClient'

export default AdminClient
