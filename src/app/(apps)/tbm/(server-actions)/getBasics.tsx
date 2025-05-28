import prisma from '@lib/prisma'

export const getTbmBase_MonthConfig = async ({yearMonth, tbmBaseId}) => {
  const userList = await prisma.user.findMany({
    where: {tbmBaseId},
  })
  const TbmBase_MonthConfig = await prisma.tbmBase_MonthConfig.findUnique({
    where: {unique_tbmBaseId_yearMonth: {yearMonth, tbmBaseId}},
  })

  return {userList, TbmBase_MonthConfig}
}
