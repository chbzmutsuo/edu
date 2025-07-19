import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {NextResponse} from 'next/server'

export const GET = async () => {
  const {result: genbaList} = await doStandardPrisma(`genba`, `findMany`, {include: {GenbaDay: {take: 1}}})

  await Promise.all(
    genbaList.map(async genba => {
      const genbaDay = genba.GenbaDay[0]
      if (genbaDay) {
        console.log('バッチ:' + genba.name)
        const res = await doStandardPrisma(`genbaDay`, `update`, {where: {id: genbaDay.id}, data: {}})
      }
    })
  )

  return NextResponse.json({})
}
