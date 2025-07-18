import prisma from 'src/lib/prisma'

export type driveInputPageType = {
  driveScheduleList: Awaited<ReturnType<typeof getDriveInputPageData>>
}

export const getDriveInputPageData = async ({user, whereQuery}: {user: any; whereQuery: any}) => {
  const driveScheduleList = await prisma.tbmDriveSchedule.findMany({
    where: {userId: user.id, date: {equals: whereQuery.gte}},
    orderBy: {sortOrder: `asc`},
    include: {
      TbmBase: {},
      TbmRouteGroup: {},
      TbmVehicle: {
        include: {
          OdometerInput: {
            where: {date: {lte: whereQuery.gte}},
            orderBy: {date: `desc`},
            take: 2,
          },
        },
      },
      TbmDriveScheduleImage: {},
    },
  })
  return driveScheduleList
}
