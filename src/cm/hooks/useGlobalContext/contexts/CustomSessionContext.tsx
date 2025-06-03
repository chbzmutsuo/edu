'use client'
import React, {createContext, useContext, ReactNode} from 'react'
import useMySession from '@hooks/globalHooks/useMySession'
import {SessionContextType} from '@hooks/useGlobalContext/contexts/types'
import Loader from '@components/utils/loader/Loader'

const SessionContext = createContext<SessionContextType | null>(null)

export function CustomSessionProvider({children}: {children: ReactNode}) {
  const sessionData = useMySession()
  if (sessionData.sessionLoading) {
    // return <Loader>Validating Session Data...</Loader>
    return <Loader />
  }

  return <SessionContext.Provider value={sessionData}>{children}</SessionContext.Provider>
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider')
  }
  return context
}
