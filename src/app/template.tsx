'use client'

import GlobalTemplate from '@components/layout/GlobalTemplate'
import {GlobalProvider} from '@hooks/useGlobalContext/hooks/GlobalProvider'
import React from 'react'

export default function template({children}) {
  return (
    <GlobalProvider>
      <GlobalTemplate>{children}</GlobalTemplate>
    </GlobalProvider>
  )
}
