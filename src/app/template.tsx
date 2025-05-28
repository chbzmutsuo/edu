'use client'

import React from 'react'

import {R_Stack} from '@components/styles/common-components/common-components'
import { sleep} from '@cm/lib/methods/common'
import ColOptionModal from '@components/DataLogic/TFs/MyTable/Thead/ColOption/ColOptionModal'
import useInitGlobalHooks from '@hooks/globalHooks/useInitGlobalHooks'

import Loader from '@components/utils/loader/Loader'

import Redirector from '@components/utils/Redirector'
import useGlobal from '@hooks/globalHooks/useGlobal'

import {useScrollPosition} from '@hooks/scrollPosition/useScrollPosition'

import {usePageTracking} from '@hooks/usePageTracking'

import {RefreshCwIcon} from 'lucide-react'

import {twMerge} from 'tailwind-merge'

export default function Global_Template(props) {
  const {globalHooks, globalPropsReady} = useInitGlobalHooks()

  if (!globalHooks) return <Loader />
  const {router, waitRendering, appbarHeight, headerMargin, pathname, roles, session} = globalHooks
  if (globalPropsReady === false || waitRendering) {
    return <Loader></Loader>
  }
  if (pathname === `/` && process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_PATH) {
    return <Redirector {...{redirectPath: `/${process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_PATH}`}} />
  }

  return <Main {...{children: props.children, router}} />
}

const Main = ({children, router}) => {
  const {headerMargin, showLoader, appbarHeight, rootPath, toggleLoad, accessScopes, session} = useGlobal()

  useScrollPosition()
  usePageTracking()

  return (
    <div>
      <ColOptionModal />
      {showLoader && <Loader />}
      <div id="poratal-root-top-fixed"></div>
      <div
        id="main-wrapper"
        className="bg-background  min-h-screen "
        style={
          rootPath === `apex`
            ? {}
            : {
                overscrollBehavior: 'none',
                //paddingTop: appbarHeight + headerMargin,
              }
        }
      >
        {children}
      </div>

      <R_Stack id="portal-root-bottom-fixed" className={twMerge(` fixed bottom-0 w-full  `)}></R_Stack>

      <div className={`fixed bottom-6 right-6`}>
        <R_Stack>
          <button
            {...{
              className: `w-7 onHover`,
              onClick: async () => await toggleLoad(async data => sleep(500)),
            }}
          >
            <RefreshCwIcon />
          </button>

          {/* {isDev && (
            <>
              <>
                {baseColorList.map(color => (
                  <Button key={color} color={color}>
                    {color}
                  </Button>
                ))}
              </>
            </>
          )} */}
        </R_Stack>
      </div>
    </div>
  )
}
