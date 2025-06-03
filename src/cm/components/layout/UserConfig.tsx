import {R_Stack} from '@components/styles/common-components/common-components'
import {T_LINK} from '@components/styles/common-components/links'
import {Paper} from '@components/styles/common-components/paper'
import {LabelValue} from '@components/styles/common-components/ParameterCard'

import MyPopover from '@components/utils/popover/MyPopover'
import {UserCircleIcon} from '@heroicons/react/20/solid'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {HREF} from '@lib/methods/urls'
import React, {useMemo} from 'react'

// 型定義を改善
interface UserConfigSession {
  scopes: {login: boolean}
  name: string
  email?: string
  roles: Array<{name: string}>
}

interface UserConfigProps {
  session?: UserConfigSession
  rootPath?: string
  query?: any
  width?: number
}

// スタイル定数をコンポーネント外に移動
const STYLING_CONFIG = {styles: {wrapper: {padding: 0, width: '100%'}}} as const

export const UserConfig = React.memo(() => {
  const {roles, accessScopes, session, rootPath, query, width} = useGlobal()

  // 幅計算をメモ化
  const dimensions = useMemo(() => {
    const maxWidth = Math.min(width * 0.8, 400)
    const minWidth = Math.min(width * 0.8, 240)
    return {maxWidth, minWidth}
  }, [width])

  // ログアウトURLをメモ化
  const logoutHref = useMemo(() => HREF('/logout', {rootPath}, query), [rootPath, query])
  const loginHref = useMemo(() => HREF('/login', {rootPath}, query), [rootPath, query])

  // ロール名の文字列をメモ化
  const roleNames = useMemo(() => session.roles.map(role => role.name).join(','), [session.roles])

  if (!session.scopes.login) {
    return <T_LINK href={loginHref}>ログイン</T_LINK>
  }

  return (
    <div>
      <MyPopover mode="click" button={<UserCircleIcon className="w-7 text-gray-700 onHover" />}>
        <Paper>
          <R_Stack style={dimensions}>
            <LabelValue styling={STYLING_CONFIG} label="氏名" value={session.name} />
            <LabelValue styling={STYLING_CONFIG} label="Email" value={session?.email} />
            <LabelValue styling={STYLING_CONFIG} label="権限" value={roleNames} />
            <R_Stack className="w-full justify-end">
              <T_LINK href={logoutHref}>ログアウト</T_LINK>
            </R_Stack>
          </R_Stack>
        </Paper>
      </MyPopover>
    </div>
  )
})

UserConfig.displayName = 'UserConfig'
