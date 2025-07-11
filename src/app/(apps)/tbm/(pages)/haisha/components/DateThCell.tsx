import {formatDate} from '@class/Days/date-utils/formatters'
import {R_Stack} from '@components/styles/common-components/common-components'
import {T_LINK} from '@components/styles/common-components/links'
import useMyNavigation from '@hooks/globalHooks/useMyNavigation'
import {createUpdate} from '@lib/methods/createUpdate'
import {HREF} from '@lib/methods/urls'
import {NotepadText} from 'lucide-react'
import React from 'react'

export default function DateThCell({tbmBase, mode, date, userList, scheduleListOnDate, doTransaction, fetchData}) {
  const {query, router} = useMyNavigation()
  const dateStr = formatDate(date, 'M/D(ddd)')

  const routeGroupMode = mode === `ROUTE`

  const ConfigButton = ({children}) => {
    return (
      <div
        className={`t-link `}
        onClick={async () => {
          const targetUserList = userList.filter(user => {
            // scheduleがapprovedのもの
            const schedule = scheduleListOnDate.find(schedule => schedule.approved && schedule.userId === user.id)
            return schedule
          })

          if (confirm(`${targetUserList.length}件のユーザーを稼働に設定しますか？`)) {
            await doTransaction({
              transactionQueryList: targetUserList.map((user, idx) => {
                const unique_userId_date = {
                  userId: user.id,
                  date,
                }

                return {
                  model: `userWorkStatus`,
                  method: `upsert`,
                  queryObject: {
                    where: {
                      unique_userId_date,
                    },
                    ...createUpdate({
                      ...unique_userId_date,
                      workStatus: '稼働',
                    }),
                  },
                }
              }),
            })
            fetchData()
          }
        }}
      >
        {children}
      </div>
    )
  }

  const href = HREF(
    '/tbm/tenko',
    {
      date: formatDate(date),
      tbmBaseId: tbmBase.id,
    },
    query
  )

  return (
    <R_Stack className={` justify-between`}>
      <div id={`#${dateStr}`}>{routeGroupMode ? <ConfigButton>{dateStr}</ConfigButton> : dateStr}</div>
      <T_LINK href={href}>
        <NotepadText />
      </T_LINK>
    </R_Stack>
  )
}
