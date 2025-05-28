import {Days} from '@class/Days/Days'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {createUpdate} from '@lib/methods/createUpdate'
import {doTransaction, transactionQuery} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'
export const autoCreateMonthConfig = async ({toggleLoad, MONTH, tbmBaseId}) => {
  const {result: tbmRouteGroupList} = await doStandardPrisma(`tbmRouteGroup`, `findMany`, {
    where: {tbmBaseId},
    include: {
      TbmMonthlyConfigForRouteGroup: {
        where: {
          yearMonth: {lte: MONTH},
        },
        take: 2,
        orderBy: {yearMonth: `desc`},
      },
    },
  })

  const targetRouteList: any[] = []
  const targetRouteListWithPreviousData: any[] = []
  tbmRouteGroupList?.filter(route => {
    const thismonthConfig = route.TbmMonthlyConfigForRouteGroup.find(config => Days.validate.isSameDate(config.yearMonth, MONTH))

    const prevMonthConfig = route.TbmMonthlyConfigForRouteGroup.find(config => {
      return new Date(config.yearMonth).getTime() < new Date(MONTH).getTime()
    })

    targetRouteList.push(route)

    if (prevMonthConfig) {
      targetRouteListWithPreviousData.push({...route, prevMonthConfig})
    }

    // if (!thismonthConfig) {
    //   targetRouteList.push(route)

    //   if (prevMonthConfig) {
    //     targetRouteListWithPreviousData.push({...route, prevMonthConfig})
    //   }
    // }

    return false
  })

  const confirmMsg = [
    `①便総数:【${tbmRouteGroupList.length}件】`,
    `②上記のうち、過去月の便設定が存在するデータ:【${targetRouteListWithPreviousData.length}件】`,
    '',
    `「②」の【${targetRouteListWithPreviousData.length}件】}便について、過去の月のデータを引き継ぎます。よろしいですか？`,
    `※引き継ぎデータは、直前の月のデータを引き継ぎます。`,
    `※個別の設定は、上書きされますので、ご注意ください。`,
  ].join('\n')
  if (!confirm(confirmMsg)) return

  if (targetRouteListWithPreviousData.length === 0) {
    return alert('引き継げるデータがありません。')
  }

  toggleLoad(async () => {
    const transactionQueryList: transactionQuery[] = targetRouteListWithPreviousData?.map((route: any) => {
      const previousMonthConfig = route.prevMonthConfig

      const payload: Prisma.TbmMonthlyConfigForRouteGroupUpsertArgs = {
        where: {
          unique_yearMonth_tbmRouteGroupId: {
            yearMonth: MONTH,
            tbmRouteGroupId: route.id,
          },
        },
        ...createUpdate({...previousMonthConfig, yearMonth: MONTH, id: undefined}),
      }

      return {
        model: `tbmMonthlyConfigForRouteGroup`,
        method: `upsert`,
        queryObject: payload,
      }
    })

    if (transactionQueryList.length > 0) {
      await doTransaction({transactionQueryList})
    }
  })
}
