import {R_Stack} from '@components/styles/common-components/common-components'
import {T_LINK} from '@components/styles/common-components/links'
import {Paper} from '@components/styles/common-components/paper'
import {LabelValue} from '@components/styles/common-components/ParameterCard'

import MyPopover from '@components/utils/popover/MyPopover'
import {UserCircleIcon} from '@heroicons/react/20/solid'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {HREF} from '@lib/methods/urls'
import React, {useMemo} from 'react'

export const UserConfig = React.memo(() => {
  const {roles, accessScopes, session, rootPath, query, width} = useGlobal()

  const styling = useMemo(() => ({styles: {wrapper: {padding: 0, width: `100%`}}}), [])
  const {maxWidth, minWidth} = useMemo(
    () => ({
      maxWidth: Math.min(width * 0.8, 400),
      minWidth: Math.min(width * 0.8, 240),
    }),
    [width]
  )

  if (session.scopes.login) {
    return (
      <div>
        <MyPopover
          {...{
            mode: `click`,
            alertOnClose: false,
            button: <UserCircleIcon className={` w-7 text-gray-700 onHover `} />,
          }}
        >
          <Paper>
            <R_Stack style={{maxWidth, minWidth, margin: `auto`}}>
              <LabelValue {...{styling, label: `氏名`, value: session.name}} />
              <LabelValue {...{styling, label: `Email`, value: session?.email}} />
              <LabelValue {...{styling, label: `権限`, value: session.roles.map(role => role.name).join(',')}} />
              <R_Stack className={`w-full  justify-end`}>
                <T_LINK href={HREF(`/logout`, {rootPath}, query)}>ログアウト</T_LINK>
              </R_Stack>
            </R_Stack>
          </Paper>
        </MyPopover>
      </div>
    )
  } else {
    return <T_LINK href={HREF(`/login`, {rootPath}, query)}>ログイン</T_LINK>
  }
})
