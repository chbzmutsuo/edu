import {toUtc} from '@cm/class/Days/date-utils/calculations'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {NextResponse} from 'next/server'

export const POST = async () => {
  const {result: genbaDay} = await doStandardPrisma(`genbaDay`, `findMany`, {})

  await Promise.all(
    genbaDay.map(async d => {
      if (String(d.date).includes(`00:00:00`)) {
        const unique_date_genbaId = {
          date: d.date,
          genbaId: d.genbaId,
        }

        await doStandardPrisma(`genbaDay`, `update`, {
          where: {unique_date_genbaId},
          data: {date: toUtc(d.date)},
        })
      }
    })
  )

  return NextResponse.json({})
}
