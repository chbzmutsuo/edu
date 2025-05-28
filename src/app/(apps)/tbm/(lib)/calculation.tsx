import {eigyoshoRecordKey, getEigyoshoUriageData} from '@app/(apps)/tbm/(server-actions)/getEigyoshoUriageData'
import {getMonthlyTbmDriveData, meisaiKey} from '@app/(apps)/tbm/(server-actions)/getMonthlyTbmDriveData'
import {carHistoryKey, getUserListWithCarHistory} from '@app/(apps)/tbm/(server-actions)/getUserListWithCarHistory'

type userSchedule = Awaited<ReturnType<typeof getMonthlyTbmDriveData>>['monthlyTbmDriveList']

export const MEIAI_SUM_ORIGIN = (userSchedule: userSchedule, dataKey: meisaiKey) => {
  return userSchedule.reduce((acc, cur) => {
    const value = cur.keyValue?.[dataKey]?.cellValue
    return acc + (Number(value) ?? 0)
  }, 0)
}
//

type userWithCarHistory = Awaited<ReturnType<typeof getUserListWithCarHistory>>

export const RUISEKI_SUM_ORIGIN = (userWithCarHistory: userWithCarHistory, dataKey: carHistoryKey) => {
  return userWithCarHistory.reduce((acc, cur) => {
    const value = cur.allCars.reduce((acc, cur) => {
      return acc + (cur[dataKey] ?? 0)
    }, 0)

    return acc + (Number(value) ?? 0)
  }, 0)
}

type MyEigyoshoUriageRecord = Awaited<ReturnType<typeof getEigyoshoUriageData>>['EigyoshoUriageRecords']
export const EIGYOSHO_URIAGE_SUMORIGIN = (MyEigyoshoUriageRecord: MyEigyoshoUriageRecord, dataKey: eigyoshoRecordKey) => {
  return MyEigyoshoUriageRecord.reduce((acc, cur) => {
    const sum = Object.keys(cur.keyValue).reduce((acc, key) => {
      const theKey = (dataKey || '') as any
      return acc + (cur.keyValue[theKey]?.cellValue ?? 0)
    }, 0)

    return acc + (Number(sum) ?? 0)
  }, 0)
}
