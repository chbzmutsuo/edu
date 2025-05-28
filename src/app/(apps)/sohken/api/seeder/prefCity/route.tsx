import prisma from '@lib/prisma'
import {NextResponse} from 'next/server'

export const POST = async () => {
  try {
    const gemba = await prisma.genba.findMany({
      orderBy: [{state: `asc`}, {city: `asc`}],
    })

    const result = await Promise.all(
      gemba.map(async g => {
        const {state: pref, city} = g
        if (!pref || !city) return
        const prefCity = await prisma.prefCity.upsert({
          where: {unique_pref_city: {pref, city}},
          update: {pref, city},
          create: {pref, city},
        })

        return await prisma.genba.update({where: {id: g.id}, data: {prefCityId: prefCity.id}})
      })
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error(error.stack) //////////
    return NextResponse.json({error: error.stack}, {status: 500})
  }
}
