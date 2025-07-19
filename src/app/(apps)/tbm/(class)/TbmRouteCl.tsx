import {Days} from '@cm/class/Days/Days'
import {TbmDriveSchedule, TbmMonthlyConfigForRouteGroup, TbmRouteGroup, TbmRouteGroupFee} from '@prisma/client'
export type TbmRouteData = TbmRouteGroup & {
  TbmMonthlyConfigForRouteGroup: TbmMonthlyConfigForRouteGroup[]
  TbmDriveSchedule: TbmDriveSchedule[]
  TbmRouteGroupFee: TbmRouteGroupFee[]
}
export default class TbmRouteCl {
  data: TbmRouteData

  constructor(TbmRouteGroup) {
    this.data = TbmRouteGroup
  }

  getMonthlyData(month: Date) {
    const DriveSchedule = this?.data?.TbmDriveSchedule?.filter(schedule => {
      return Days.validate.isSameMonth(month, schedule.date)
    })

    const monthConfig = this?.data?.TbmMonthlyConfigForRouteGroup?.find(config => {
      return Days.validate.isSameMonth(month, config.yearMonth)
    })

    const {tsukoryoSeikyuGaku = 0} = monthConfig ?? {}

    const jitsudoKaisu = DriveSchedule?.length ?? 0

    const tsukoryo = tsukoryoSeikyuGaku ? tsukoryoSeikyuGaku / jitsudoKaisu : 0

    return {tsukoryo, jitsudoKaisu}
  }
}
