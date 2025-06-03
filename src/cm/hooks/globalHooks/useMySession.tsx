import useMyNavigation from 'src/cm/hooks/globalHooks/useMyNavigation'
import {useSession} from 'next-auth/react'
import {anyObject} from '@cm/types/types'
import useSWR from 'swr'
import useUserRole from '@hooks/useUserRole'
import {FakeOrKeepSession} from 'src/non-common/scope-lib/FakeOrKeepSession'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {judgeIsAdmin} from 'src/non-common/scope-lib/judgeIsAdmin'
import {UserCl} from '@class/UserCl'
import {User} from '@prisma/client'
import {useMemo} from 'react'
import {Session} from 'next-auth'

export type customeSessionType = anyObject
export default function useCustomSession(props?: {session?: Session | null}) {
  const {query} = useMyNavigation()

  const {data: getSessoin, status} = useSession()

  const realSession = status === 'loading' ? props?.session?.user : (getSessoin?.user as User)

  const {globalUserId} = judgeIsAdmin(realSession, query)

  const {data: fakeSession} = useSWR(JSON.stringify({globalUserId, realSession, query}), async () => {
    const fakeSession = await FakeOrKeepSession({query, realSession})

    return fakeSession ?? null
  })

  const {roles, roleIsLoading} = useUserRole({session: fakeSession})

  const userData = useMemo(() => ({...fakeSession, role: realSession?.role}), [fakeSession, realSession])

  const accessScopes = () => getScopes(userData, {query, roles})

  const User = new UserCl({
    user: userData,
    roles,
    scopes: getScopes(fakeSession, {query, roles}),
  })
  const session = {...User.data}

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
