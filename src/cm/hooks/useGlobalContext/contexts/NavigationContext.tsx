'use client'
import React, {createContext, useContext, ReactNode} from 'react'
import useMyNavigation from '@hooks/globalHooks/useMyNavigation'
import {NavigationContextType} from './types'
import Loader from '@components/utils/loader/Loader'

const NavigationContext = createContext<NavigationContextType | null>(null)

export function NavigationProvider({children}: {children: ReactNode}) {
  const navigationData = useMyNavigation()

  if (navigationData.query === null || navigationData.query === undefined) {
    return <Loader>Validating Navigation Data...</Loader>
  }

  return <NavigationContext.Provider value={navigationData}>{children}</NavigationContext.Provider>
}

export function useNavigationContext() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigationContext must be used within NavigationProvider')
  }
  return context
}
