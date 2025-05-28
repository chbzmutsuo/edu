'use client'
import {Button} from '@components/styles/common-components/Button'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {basePath} from '@lib/methods/common'
import React from 'react'

export default function CalenderRefresher() {
  const {toggleLoad} = useGlobal()
  return (
    <div>
      <Button
        onClick={() => {
          toggleLoad(async data => {
            const res = await fetch(`${basePath}/sohken/api/cron/refreshGoogleCalendar`).then(res => res.json())
            console.log(res)
          })
        }}
      >
        Googleカレンダー更新
      </Button>
    </div>
  )
}
