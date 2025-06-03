export const dynamic = 'force-dynamic'
import 'src/cm/styles/globals.css'

import {Suspense} from 'react'
import {Metadata} from 'next'
import GlobalToast from '@components/utils/GlobalToast'

import React from 'react'

import {fetcher} from '@lib/swr'
import {GlobalProvider} from '@hooks/useGlobalContext/hooks/GlobalProvider'
import GlobalTemplate from '@components/layout/GlobalTemplate'

const title = process.env.NEXT_PUBLIC_TITLE
export const metadata: Metadata = {title: title}

const swrConfig = {
  fetcher,
  revalidateOnFocus: false, // フォーカス時の再検証を無効化（必要に応じて）
  revalidateOnReconnect: true, // 再接続時の再検証
  dedupingInterval: 2000, // 重複リクエストの防止間隔
  errorRetryCount: 3, // エラー時のリトライ回数
  errorRetryInterval: 5000, // リトライ間隔
}

export default async function AppRootLayout(props) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {/* <StrictMode> */}

        <Suspense>
          <GlobalToast></GlobalToast>
          {props.children}
        </Suspense>
        {/* </StrictMode> */}
      </body>
    </html>
  )
}
