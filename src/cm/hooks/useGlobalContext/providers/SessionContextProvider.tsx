'use client'
import React, {createContext, useContext, ReactNode} from 'react'
import useMySession from '@hooks/globalHooks/useMySession'
import {SessionContextType} from '@hooks/useGlobalContext/providers/types'
import Loader from '@components/utils/loader/Loader'
import {Session} from 'next-auth'
import {SessionProvider} from 'next-auth/react'
import {SWRConfig} from 'swr'
import {fetcher} from '@lib/swr'
import DeviceContextProvider from '@hooks/useGlobalContext/providers/DeviceContextProvider'
import NavigationContextProvider from '@hooks/useGlobalContext/providers/NavigationContextProvider'
import LoaderContextProvider from '@hooks/useGlobalContext/providers/LoaderContextProvider'

const SessionContext = createContext<SessionContextType | null>(null)

const SessionContextProvider = ({children, session}: {children: ReactNode; session?: Session}) => {
  const swrConfig = {
    fetcher,
    revalidateOnFocus: false, // フォーカス時の再検証を無効化（必要に応じて）
    revalidateOnReconnect: true, // 再接続時の再検証
    dedupingInterval: 2000, // 重複リクエストの防止間隔
    errorRetryCount: 3, // エラー時のリトライ回数
    errorRetryInterval: 5000, // リトライ間隔
  }

  return (
    <SessionProvider>
      <SWRConfig value={swrConfig}>
        <ProviderChain {...{children, session}}></ProviderChain>
      </SWRConfig>
    </SessionProvider>
  )
}

const ProviderChain = ({children, session}: {children: ReactNode; session?: Session}) => {
  const sessionData = useMySession({session})

  if (sessionData.sessionLoading) {
    return <Loader>Loading...</Loader>
    // return <Loader />
  }

  return (
    <SessionContext.Provider value={sessionData}>
      <DeviceContextProvider>
        <NavigationContextProvider>
          <LoaderContextProvider>{children}</LoaderContextProvider>
        </NavigationContextProvider>
      </DeviceContextProvider>
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider')
  }
  return context
}

export default SessionContextProvider
