'use client'

import Redirector from '@components/utils/Redirector'
import useGlobal from '@hooks/globalHooks/useGlobal'
import React from 'react'

export default function HealthPage() {
  const {PC} = useGlobal()
  if (PC) {
    return <Redirector {...{redirectPath: '/health/monthly'}} />
  } else {
    return <Redirector {...{redirectPath: '/health/daily'}} />
  }
}
