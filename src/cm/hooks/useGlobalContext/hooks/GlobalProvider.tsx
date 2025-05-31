'use client'
import React, {ReactNode, memo} from 'react'
import {SessionProvider} from '@hooks/useGlobalContext/contexts/SessionContext'
import {DeviceProvider} from '@hooks/useGlobalContext/contexts/DeviceContext'
import {LoaderProvider} from '@hooks/useGlobalContext/contexts/LoaderContext'
import {NavigationProvider} from '@hooks/useGlobalContext/contexts/NavigationContext'

import Loader from '@components/utils/loader/Loader'

interface GlobalProviderProps {
  children: ReactNode
}

export const GlobalProvider = memo(function GlobalProvider({children}: GlobalProviderProps) {
  // Provider の順序は依存関係を考慮
  return (
    <SessionProvider>
      <DeviceProvider>
        <NavigationProvider>
          <LoaderProvider>{children}</LoaderProvider>
        </NavigationProvider>
      </DeviceProvider>
    </SessionProvider>
  )
})

// 単一のProviderでラップするヘルパー
export function withGlobalProvider<P extends object>(Component: React.ComponentType<P>) {
  return memo(function WrappedComponent(props: P) {
    // サーバーサイドでの早期リターン
    if (typeof window === 'undefined') {
      return <Loader>Validating Window Data...</Loader>
    }

    return (
      <GlobalProvider>
        <Component {...props} />
      </GlobalProvider>
    )
  })
}
