'use client'

import React, {Suspense} from 'react'
import {R_Stack} from '@components/styles/common-components/common-components'
import {sleep} from '@cm/lib/methods/common'
import ColOptionModal from '@components/DataLogic/TFs/MyTable/Thead/ColOption/ColOptionModal'
import useInitGlobalHooks from '@hooks/globalHooks/useInitGlobalHooks'
import Loader from '@components/utils/loader/Loader'
import Redirector from '@components/utils/Redirector'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {useScrollPosition} from '@hooks/scrollPosition/useScrollPosition'
import {usePageTracking} from '@hooks/usePageTracking'
import {RefreshCwIcon} from 'lucide-react'
import {twMerge} from 'tailwind-merge'

// 新しいContext方式のインポート

import {useGlobalContext} from '@hooks/useGlobalContext/hooks/useGlobalContext'
import {GlobalProvider} from '@hooks/useGlobalContext/hooks/GlobalProvider'

// 環境変数で切り替え可能にする
const USE_JOTAI_CONTEXT_MODE = process.env.NEXT_PUBLIC_USE_JOTAI_GLOBAL === 'true'

export default function Global_Template(props) {
  if (USE_JOTAI_CONTEXT_MODE) {
    // 既存のJotai方式（デフォルト）
    return <JotaiBasedTemplate {...props} />
  }

  // 新しいContext方式
  return (
    <GlobalProvider>
      <Suspense fallback={<Loader />}>
        <ContextBasedTemplate {...props} />
      </Suspense>
    </GlobalProvider>
  )
}

// 既存のJotai方式のテンプレート
function JotaiBasedTemplate(props) {
  const {globalHooks, globalPropsReady} = useInitGlobalHooks()

  if (!globalHooks) return <Loader />

  const {router, waitRendering, pathname} = globalHooks

  if (globalPropsReady === false || waitRendering) {
    return <Loader />
  }

  if (pathname === `/` && process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_PATH) {
    return <Redirector redirectPath={`/${process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_PATH}`} />
  }

  return <Main useGlobalHook={useGlobal}>{props.children}</Main>
}

// 新しいContext方式のテンプレート
function ContextBasedTemplate(props) {
  const globalData = useGlobalContext()
  const {waitRendering, pathname} = globalData
  if (pathname === `/` && process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_PATH) {
    return <Redirector redirectPath={`/${process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_PATH}`} />
  }

  return <Main useGlobalHook={useGlobalContext}>{props.children}</Main>
}

// 共通のMainコンポーネント（両方式で使用）
const Main = ({children, useGlobalHook}) => {
  const {showLoader, rootPath, toggleLoad} = useGlobalHook()

  useScrollPosition()
  usePageTracking()

  return (
    <div>
      <ColOptionModal />
      {showLoader && <Loader />}
      <div id="poratal-root-top-fixed"></div>
      <div
        id="main-wrapper"
        className="bg-background min-h-screen"
        style={
          rootPath === `apex`
            ? {}
            : {
                overscrollBehavior: 'none',
              }
        }
      >
        {children}
      </div>

      <R_Stack id="portal-root-bottom-fixed" className={twMerge(`fixed bottom-0 w-full`)} />

      <div className={`fixed bottom-6 right-6`}>
        <R_Stack>
          <button className={`w-7 onHover`} onClick={async () => await toggleLoad(async () => sleep(500))}>
            <RefreshCwIcon />
          </button>
        </R_Stack>
      </div>
    </div>
  )
}
