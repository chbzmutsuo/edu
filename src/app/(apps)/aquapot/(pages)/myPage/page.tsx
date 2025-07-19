'use client'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {CenterScreen} from '@cm/components/styles/common-components/common-components'

import Redirector from '@cm/components/utils/Redirector'
import LoginForm from '@app/login/LoginForm'
import {Fields} from '@cm/class/Fields/Fields'
import {HREF} from '@cm/lib/methods/urls'

export default function DynamicMasterPage(props) {
  const {query} = useGlobal()

  const {session, accessScopes} = useGlobal()
  const {aqCustomerId} = session.scopes.getAquepotScopes()

  if (aqCustomerId) {
    return <Redirector redirectPath={HREF(`/aquapot/myPage/${aqCustomerId}`, {}, query)} />
  }

  return (
    <CenterScreen>
      <LoginForm
        {...{
          columns: new Fields([
            {
              id: 'email',
              label: 'メールアドレス',
              form: {register: {required: '必須項目です'}},
            },
            {
              id: 'password',
              label: '顧客番号',
              form: {register: {required: '必須項目です'}},
            },
          ]).transposeColumns(),
        }}
      />
    </CenterScreen>
  )
}
