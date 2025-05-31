'use client'
import React, {createContext, useContext, ReactNode} from 'react'
import useWindowSize from '@hooks/useWindowSize'
import {DeviceContextType} from './types'
import Loader from '@components/utils/loader/Loader'

const DeviceContext = createContext<DeviceContextType | null>(null)

export function DeviceProvider({children}: {children: ReactNode}) {
  const deviceData = useWindowSize()

  const {device, width} = deviceData

  if (!device || width === 0) {
    return <Loader>Validating Device Data...</Loader>
  }

  return <DeviceContext.Provider value={deviceData}>{children}</DeviceContext.Provider>
}

export function useDeviceContext() {
  const context = useContext(DeviceContext)
  if (!context) {
    throw new Error('useDeviceContext must be used within DeviceProvider')
  }
  return context
}
