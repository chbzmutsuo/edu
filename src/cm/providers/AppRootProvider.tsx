'use client'
import {fetcher} from 'src/cm/lib/swr'
const swrConfig = {
  fetcher,
  revalidateOnFocus: false, // フォーカス時の再検証を無効化（必要に応じて）
  revalidateOnReconnect: true, // 再接続時の再検証
  dedupingInterval: 2000, // 重複リクエストの防止間隔
  errorRetryCount: 3, // エラー時のリトライ回数
  errorRetryInterval: 5000, // リトライ間隔
}

import {SWRConfig} from 'swr'
import {SessionProvider} from 'next-auth/react'
export default function AppRootProvider({children}: {children: React.ReactNode}) {
  return (
    <SessionProvider>
      <SWRConfig value={swrConfig}>{children}</SWRConfig>
    </SessionProvider>
  )
}
