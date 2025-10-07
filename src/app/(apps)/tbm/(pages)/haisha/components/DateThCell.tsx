import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {T_LINK} from '@cm/components/styles/common-components/links'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import {createUpdate} from '@cm/lib/methods/createUpdate'
import {HREF} from '@cm/lib/methods/urls'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
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
          const {result: usersOnDate} = await doStandardPrisma(`user`, `findMany`, {
            where: {
              tbmBaseId: tbmBase.id,
              TbmDriveSchedule: {some: {date}},
            },
            include: {
              TbmDriveSchedule: {where: {date}},
            },
          })

          const message = [
            `本営業所で、${formatDate(date, 'M/D(ddd)')}に配車設定がされているユーザー 【${usersOnDate.length}】件をの勤怠を「出勤」に設定します。`,
            `すでに設定されている勤怠のデータは上書きされますのでご注意ください。`,
            '',
            `-------- 対象ユーザ --------`,
            usersOnDate.map(user => `・${user.name}`).join(`\n`),
            `--------------------------`,
          ].join(`\n`)

          if (confirm(message)) {
            await doTransaction({
              transactionQueryList: usersOnDate.map((user, idx) => {
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
                      workStatus: TBM_CODE.WORK_STATUS_KBN.raw.SHUKKIN.code,
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
      <div id={`#${dateStr}`}>{!routeGroupMode ? <ConfigButton>{dateStr}</ConfigButton> : dateStr}</div>
      <T_LINK href={href}>
        <NotepadText />
      </T_LINK>
    </R_Stack>
  )
}
