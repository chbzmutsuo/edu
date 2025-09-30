'use server'

export type tbmTableKeyValue = {
  type?: any
  label: string | React.ReactNode
  cellValue?: number | string | Date | null
  style?: {
    width?: number
    minWidth?: number
    backgroundColor?: string
  }
}

type userType = User & {TbmVehicle?: TbmVehicle}

export type getMonthlyTbmDriveDataReturn = Awaited<ReturnType<typeof getMonthlyTbmDriveData>>
export type MonthlyTbmDriveData = getMonthlyTbmDriveDataReturn['monthlyTbmDriveList'][number]

import prisma from 'src/lib/prisma'
import {TbmVehicle, User} from '@prisma/client'
import {DriveScheduleCl, DriveScheduleData, unkoMeisaiKeyValue} from '@app/(apps)/tbm/(class)/DriveScheduleCl'

export const getMonthlyTbmDriveData = async ({whereQuery, tbmBaseId}) => {
  const ConfigForMonth = await prisma.tbmMonthlyConfigForRouteGroup.findFirst({
    where: {
      yearMonth: whereQuery.gte,
      TbmRouteGroup: {tbmBaseId: tbmBaseId},
    },
  })

  const tbmDriveSchedule = await DriveScheduleCl.getDriveScheduleList({whereQuery, tbmBaseId})
  const monthlyTbmDriveList = tbmDriveSchedule.map(schedule => {
    const unkoMeisaiKeyValue = new DriveScheduleCl(schedule).unkoMeisaiCols
    return {
      schedule,
      keyValue: unkoMeisaiKeyValue,
    }
  }) as {schedule: DriveScheduleData; keyValue: unkoMeisaiKeyValue}[]

  const userList: userType[] = monthlyTbmDriveList
    .reduce((acc, row) => {
      const {schedule} = row
      const {User} = schedule
      if (acc.find(user => User && user?.id === User?.id)) {
        return acc
      }
      acc.push(User)
      return acc
    }, [] as userType[])
    .sort((a, b) => -String(a?.code ?? '').localeCompare(String(b?.code ?? '')))

  return {
    monthlyTbmDriveList,
    ConfigForMonth,
    userList,
  }
}
