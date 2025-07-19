import {targetUsers} from '@app/(apps)/sohken/api/cron/targetUsers'
import {GoogleCalendar_Get} from '@app/api/google/actions/calendarAPI'
import {Days} from '@cm/class/Days/Days'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

import {createUpdate} from '@cm/lib/methods/createUpdate'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'

import {NextRequest, NextResponse} from 'next/server'

export const GET = async (req: NextRequest) => {
  await doStandardPrisma(`sohkenGoogleCalendar`, `deleteMany`, {where: {id: {gte: 0}}})
  // if ((await isCron({req})) === false) {
  //   const res = {success: false, message: `Unauthorized`, result: null}
  //   const status = {status: 401, statusText: `Unauthorized`}
  //   return NextResponse.json(res, status)
  // })

  const transactionQueryList: transactionQuery[] = []
  const UserSchedule = await Promise.all(
    targetUsers
      // .filter(user => (isDev ? user.email === 'sohken.sugawara@gmail.com' : true))
      .map(async user => {
        try {
          const events = (
            await GoogleCalendar_Get({
              calendarId: user.email,
              from: Days.day.add(new Date(), -90),
            })
          )?.events?.items

          events
            ?.filter(data => data.visibility !== 'private')
            ?.forEach(async data => {
              const eventId = data.id
              const startAt = data.start?.dateTime ? new Date(data.start?.dateTime) : undefined
              const endAt = data.end?.dateTime ? new Date(data.end?.dateTime) : undefined

              const dateSource: any = data?.start?.date ?? data?.start?.dateTime ?? data?.end?.date ?? data?.end?.dateTime
              const date = dateSource ? getMidnight(dateSource) : undefined

              const summary = data.summary

              const queryObject = {
                where: {eventId},
                ...createUpdate({
                  calendarId: user.email,
                  eventId,
                  summary,
                  startAt,
                  endAt,
                  date,
                }),
              }

              transactionQueryList.push({model: `sohkenGoogleCalendar`, method: `upsert`, queryObject})
            })
          return events
        } catch (error) {
          console.error(error) //////////

          return {
            user: {
              name: user.name,
              email: user.email,
            },
            events: [],
          }
        }
      })
  )

  await doTransaction({transactionQueryList})

  return NextResponse.json({UserSchedule})
}
