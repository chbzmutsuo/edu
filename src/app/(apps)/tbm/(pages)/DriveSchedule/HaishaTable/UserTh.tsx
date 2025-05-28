'use client'
import React from 'react'

import {C_Stack} from '@components/styles/common-components/common-components'
import {KeyValue} from '@components/styles/common-components/ParameterCard'
import {HREF} from '@lib/methods/urls'
import {T_LINK} from '@components/styles/common-components/links'

export default function UserTh({user, admin, query}) {
  const userWorkStatusList = user.userWorkStatusList
  const countByStatus = Object.keys(userWorkStatusList).reduce((acc, dateStr) => {
    const userWorkStatus = userWorkStatusList[dateStr]
    acc[userWorkStatus] = (acc[userWorkStatus] || 0) + 1
    return acc
  }, {}) as Record<string, number>

  return (
    <C_Stack className={` h-full justify-start gap-1`}>
      <div className={` grid grid-cols-2 gap-1`}>
        <KeyValue label="">
          {admin ? <T_LINK href={HREF(`/tbm/user/${user.id}`, {userId: user.id}, query)}>{user.name} </T_LINK> : user.name}
          <span className={`text-xs`}>({user.code})</span>
        </KeyValue>
        <KeyValue label="稼働">{countByStatus?.稼働 ?? '0'}</KeyValue>
        <KeyValue label="休み">{countByStatus?.休み ?? '0'}</KeyValue>
        <KeyValue label="有給">{countByStatus?.有給 ?? '0'}</KeyValue>
      </div>
    </C_Stack>
  )
}
