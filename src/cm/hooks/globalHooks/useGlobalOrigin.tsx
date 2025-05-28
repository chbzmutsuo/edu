'use client'
import useMySession from '@hooks/globalHooks/useMySession'
import useMyNavigation from 'src/cm/hooks/globalHooks/useMyNavigation'

import useLoader from 'src/cm/hooks/globalHooks/useLoader'
import useWindowSize from 'src/cm/hooks/useWindowSize'

export type useGlobalPropType = ReturnType<typeof useGlobalOrigin>

export default function useGlobalOrigin(place?: any) {
  type useMyNavigationHookType = ReturnType<typeof useMyNavigation>
  type useMySessionHookType = ReturnType<typeof useMySession>
  type loadingHookType = ReturnType<typeof useLoader>
  type useWindowSizeHookType = ReturnType<typeof useWindowSize>
  const useMyNavigationHook: useMyNavigationHookType = useMyNavigation() ?? {}
  const useMySessionHook: useMySessionHookType = useMySession() ?? {}
  const loading: loadingHookType = useLoader()
  const useWindowSizeHook: useWindowSizeHookType = useWindowSize() ?? {}

  const result = {
    ...useWindowSizeHook,
    ...useMyNavigationHook,
    ...useMySessionHook,
    ...loading,
  }

  const {width, globalLoaderAtom, status, session, device} = result

  const waitRendering = [
    status === `loading`,
    useMySessionHook.sessionLoading,
    useMyNavigationHook.query === null,
    useMyNavigationHook.query === undefined,
    typeof window === `undefined`,
    width === 0,
    !session,
    !device,
  ].some(Boolean)

  const showLoader = waitRendering || globalLoaderAtom

  const useGlobalDeps = [waitRendering, showLoader]

  return {...result, waitRendering, showLoader, useGlobalDeps}
}
