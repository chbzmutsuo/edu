'use server'

import prisma from 'src/lib/prisma'
import {GetListDataParams, HaishaListData} from '../types/haisha-page-types'

export const getListData = async (props: GetListDataParams): Promise<HaishaListData> => {
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

  const rawTbmDriveSchedule = await prisma.tbmDriveSchedule.findMany({
    select: {
      id: true,
      date: true,
      userId: true,
      tbmRouteGroupId: true,
      tbmBaseId: true,
      tbmVehicleId: true,
      TbmRouteGroup: {
        select: {
          id: true,
          code: true,
          name: true,
          routeName: true,
          seikyuKbn: true,
        },
      },
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

  // 重複検知：同じ日付で、同じ「便、車両、ドライバー」の組み合わせをチェック
  const TbmDriveSchedule = rawTbmDriveSchedule.map(schedule => {
    const duplicated = rawTbmDriveSchedule.some(
      otherSchedule =>
        otherSchedule.id !== schedule.id &&
        otherSchedule.date.getTime() === schedule.date.getTime() &&
        otherSchedule.tbmRouteGroupId === schedule.tbmRouteGroupId &&
        otherSchedule.tbmVehicleId === schedule.tbmVehicleId &&
        otherSchedule.userId === schedule.userId
    )

    return {
      ...schedule,
      duplicated,
    }
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
      routeName: true,
      seikyuKbn: true,
      tbmBaseId: true,
      TbmRouteGroupCalendar: {
        select: {id: true, date: true, holidayType: true, remark: true},
        where: {date: whereQuery},
      },
    },
    where: commonWhere,
    orderBy: [{code: 'asc'}, {name: 'asc'}],
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
  } as HaishaListData

  return result
}
