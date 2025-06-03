'use client'
import React, {ReactNode, memo} from 'react'
import {CustomSessionProvider} from '@hooks/useGlobalContext/contexts/CustomSessionContext'
import {DeviceProvider} from '@hooks/useGlobalContext/contexts/DeviceContext'
import {LoaderProvider} from '@hooks/useGlobalContext/contexts/LoaderContext'
import {NavigationProvider} from '@hooks/useGlobalContext/contexts/NavigationContext'
import {SWRConfig} from 'swr'
import {fetcher} from '@lib/swr'
import {SessionProvider} from 'next-auth/react'

interface GlobalProviderProps {
  children: ReactNode
}

const swrConfig = {
  fetcher,
  revalidateOnFocus: false, // フォーカス時の再検証を無効化（必要に応じて）
  revalidateOnReconnect: true, // 再接続時の再検証
  dedupingInterval: 2000, // 重複リクエストの防止間隔
  errorRetryCount: 2, // エラー時のリトライ回数
  errorRetryInterval: 5000, // リトライ間隔
}

export const GlobalProvider = memo(function GlobalProvider({children}: GlobalProviderProps) {
  // Provider の順序は依存関係を考慮
  return (
    <SessionProvider>
      <CustomSessionProvider>
        <SWRConfig value={swrConfig}>
          <DeviceProvider>
            <NavigationProvider>
              <LoaderProvider>{children}</LoaderProvider>
            </NavigationProvider>
          </DeviceProvider>
        </SWRConfig>
      </CustomSessionProvider>
    </SessionProvider>
  )
})
