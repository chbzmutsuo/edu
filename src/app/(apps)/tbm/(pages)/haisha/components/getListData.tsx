'use server'

import prisma from '@lib/prisma'
import {
  TbmDriveSchedule,
  TbmVehicle,
  TbmRouteGroup,
  OdometerInput,
  User,
  UserWorkStatus,
  TbmRouteGroupCalendar,
  TbmBase,
} from '@prisma/client'
import {haishaTableMode} from '@app/(apps)/tbm/(pages)/haisha/components/HaishaTable'

export type haishaListData = Awaited<ReturnType<typeof getListData>>
export const getListData = async (props: {tbmBaseId: number; whereQuery: any; mode: haishaTableMode; takeSkip: any}) => {
  const {tbmBaseId, whereQuery, mode, takeSkip} = props
  const getMaxRecord = async () => {
    if (mode === 'ROUTE') {
      const maxRecord = await prisma.tbmRouteGroup.count({where: {tbmBaseId}})

      return maxRecord
    } else {
      const maxRecord = await prisma.user.count({where: {tbmBaseId}})

      return maxRecord
    }
  }

  const commonWhere = {tbmBaseId}
  const tbmBase = await prisma.tbmBase.findUnique({select: {id: true, name: true}, where: {id: tbmBaseId}})

  const TbmDriveSchedule = await prisma.tbmDriveSchedule.findMany({
    select: {
      id: true,
      date: true,
      userId: true,
      tbmRouteGroupId: true,
      tbmBaseId: true,
      TbmRouteGroup: {select: {id: true, code: true, name: true, seikyuKbn: true}},
      finished: true,
      confirmed: true,
      approved: true,
      User: {select: {id: true, name: true}},
      TbmVehicle: {
        select: {
          id: true,
          code: true,
          vehicleNumber: true,
          shape: true,
          type: true,
          OdometerInput: {select: {id: true, odometerStart: true, odometerEnd: true, date: true}},
        },
      },
    },
    where: {
      date: {gte: whereQuery.gte, lte: whereQuery.lt},
    },
    orderBy: [{date: 'asc'}, {TbmRouteGroup: {code: 'asc'}}],
  })

  const userList = await prisma.user.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      tbmBaseId: true,
      UserWorkStatus: {
        select: {id: true, date: true, workStatus: true, userId: true},
        where: {date: whereQuery},
      },
    },
    where: commonWhere,
    orderBy: {code: 'asc'},
    ...(mode === 'DRIVER' ? {...takeSkip} : {}),
  })

  const tbmRouteGroup = await prisma.tbmRouteGroup.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      seikyuKbn: true,
      tbmBaseId: true,
      TbmRouteGroupCalendar: {
        select: {id: true, date: true, holidayType: true, remark: true},
        where: {date: whereQuery},
      },
    },
    where: commonWhere,
    orderBy: {code: 'asc'},
    ...(mode === 'ROUTE' ? {...takeSkip} : {}),
  })

  const carList = await prisma.tbmVehicle.findMany({
    select: {id: true, code: true, vehicleNumber: true, shape: true, type: true},
    where: commonWhere,
    orderBy: {code: 'asc'},
  })

  const userWorkStatusCount = await prisma.userWorkStatus.groupBy({
    by: ['userId', 'workStatus'],
    orderBy: {workStatus: 'desc'},
    _count: {_all: true},
    where: {date: whereQuery},
  })

  const result = {
    tbmBase,
    TbmDriveSchedule,
    userList,
    tbmRouteGroup,
    carList,
    maxCount: await getMaxRecord(),
    userWorkStatusCount,
  } as {
    tbmBase: TbmBase & {id: number; name: string}
    TbmDriveSchedule: (TbmDriveSchedule & {
      TbmRouteGroup: TbmRouteGroup & {TbmRouteGroupCalendar: TbmRouteGroupCalendar[]}
      TbmVehicle: TbmVehicle & {OdometerInput: OdometerInput[]}
      User: {id: number; name: string}
    })[]
    userList: (User & {UserWorkStatus: UserWorkStatus[]})[]
    tbmRouteGroup: (TbmRouteGroup & {TbmRouteGroupCalendar: TbmRouteGroupCalendar[]})[]
    carList: TbmVehicle[]
    maxCount: number
    userWorkStatusCount: {userId: number; workStatus: string; _count: {_all: number}}[]
  }

  return result
}
