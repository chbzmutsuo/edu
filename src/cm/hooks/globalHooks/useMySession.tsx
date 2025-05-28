import useMyNavigation from 'src/cm/hooks/globalHooks/useMyNavigation'
import {useSession} from 'next-auth/react'
import {anyObject} from '@cm/types/types'
import useSWR from 'swr'
import useUserRole from '@hooks/useUserRole'
import {FakeOrKeepSession} from 'src/non-common/scope-lib/FakeOrKeepSession'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {judgeIsAdmin} from 'src/non-common/scope-lib/judgeIsAdmin'
import {UserCl} from '@class/UserCl'

export type customeSessionType = anyObject
export default function useCustomSession() {
  const {query} = useMyNavigation()

  const {data: getSessoin, status} = useSession()
  const realSession = status === 'loading' ? undefined : getSessoin?.user

  const {globalUserId} = judgeIsAdmin(realSession, query)

  const {data: fakeSession} = useSWR(JSON.stringify({globalUserId, realSession, query}), async () => {
    const fakeSession = await FakeOrKeepSession({query, realSession})

    return fakeSession ?? null
  })

  const {roles, roleIsLoading} = useUserRole({session: fakeSession})

  const accessScopes = () => getScopes(fakeSession, {query, roles})

  const User = new UserCl({
    user: fakeSession,
    roles,
    scopes: getScopes(fakeSession, {query, roles}),
  })
  const session = User.data

  const sessionLoading = fakeSession === undefined || status === 'loading' || roleIsLoading
  return {
    sessionLoading,
    status,
    accessScopes,
    fakeSession,
    session,
    roles,
    useMySessionDependencies: [JSON.stringify(roles), sessionLoading, status],
  }
}
