'use client'

import Redirector from '@components/utils/Redirector'
import useWindowSize from '@hooks/useWindowSize'
import React from 'react'

export default function HealthPage() {
  const {PC} = useWindowSize()
  if (PC) {
    return <Redirector {...{redirectPath: '/health/monthly'}} />
  } else {
    return <Redirector {...{redirectPath: '/health/daily'}} />
  }
}
