'use server'
import FuelHistoryCl from '@app/(apps)/tbm/(class)/FuelHistoryCl'
import prisma from '@lib/prisma'

const keiyuPerLiter = 159.98

export const getNenpiDataByCar = async ({tbmBaseId, whereQuery, TbmBase_MonthConfig}) => {
  console.warn(`営業所 / 月ごとに軽油単価の設定が必要です。`)

  const vehicleList = await prisma.tbmVehicle.findMany({where: {tbmBaseId}})

  const fuelByCar = await prisma.tbmRefuelHistory.groupBy({
    by: [`tbmVehicleId`],
    where: {date: whereQuery, TbmVehicle: {tbmBaseId}},
    _sum: {amount: true},
    _avg: {amount: true},
    _max: {odometer: true},
  })

  await prisma.tbmVehicle.findMany({where: {tbmBaseId}, include: {TbmRefuelHistory: {}}})

  const nenpiKanriDataListByCar = fuelByCar.map(item => {
    const vehicle = vehicleList.find(v => v.id === item.tbmVehicleId)
    const FuelHistory = new FuelHistoryCl(item)
    const nenpiData = FuelHistory.getNenpiData(TbmBase_MonthConfig)
    return {vehicle, ...nenpiData}
  })

  return {
    nenpiKanriDataListByCar,
  }
}
