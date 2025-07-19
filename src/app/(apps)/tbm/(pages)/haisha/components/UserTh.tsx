'use client'
import React from 'react'

import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {KeyValue} from '@cm/components/styles/common-components/ParameterCard'
import {HREF} from '@cm/lib/methods/urls'
import {T_LINK} from '@cm/components/styles/common-components/links'
import {haishaListData} from './getListData'

export default function UserTh({
  user,
  admin,
  query,
  userWorkStatusCount,
}: {
  user: haishaListData['userList'][number]
  admin: boolean
  query: any
  userWorkStatusCount: haishaListData['userWorkStatusCount']
}) {
  if (user) {
    const countByStatus = userWorkStatusCount
      .filter(item => item.userId === user.id)
      .reduce((acc, item) => {
        acc[item.workStatus] = (acc[item.workStatus] || 0) + item._count._all
        return acc
      }, {})

    return (
      <C_Stack className={`text-xs h-full justify-start gap-0`}>
        <KeyValue label="">
          {admin ? <T_LINK href={HREF(`/tbm/user/${user.id}`, {userId: user.id}, query)}>{user.name} </T_LINK> : user.name}
          <span className={`text-xs`}>({user.code})</span>
        </KeyValue>

        <div>
          {Object.keys(countByStatus).map((status, index) => {
            if (status !== 'null') {
              return (
                <div key={index} className={`flex items-center gap-1`}>
                  <small>{status}:</small>
                  <small>{countByStatus[status] ?? '0'}</small>
                </div>
              )
            }
          })}
        </div>
      </C_Stack>
    )
  }
}
