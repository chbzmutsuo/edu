'use server'
import {getNenpiDataByCar} from '@app/(apps)/tbm/(server-actions)/getNenpiDataByCar'
import prisma from '@lib/prisma'
import {TbmVehicle, User} from '@prisma/client'

export type carHistoryKey = `soukouKyori` | `heikinNenpi` | `nenryoiShiyoryo` | `fuelCost`

export const getUserListWithCarHistory = async ({tbmBaseId, whereQuery, TbmBase_MonthConfig}) => {
  const {nenpiKanriDataListByCar} = await getNenpiDataByCar({tbmBaseId, whereQuery, TbmBase_MonthConfig})
  const userList = await prisma.user.findMany({
    where: {tbmBaseId},
    include: {
      TbmVehicle: {},
      TbmDriveSchedule: {
        where: {
          date: whereQuery,
          // finished: true,
        },
        include: {
          TbmVehicle: {
            include: {OdometerInput: {}},
          },
        },
      },
    },
  })

  const userListWithCarHistory = userList.map(user => {
    const {id: userId, TbmDriveSchedule} = user

    let allCars = TbmDriveSchedule.reduce((acc, cur, i) => {
      const {TbmVehicle} = cur
      if (!acc.find(v => v.id === TbmVehicle?.id)) {
        acc.push(TbmVehicle)
      }
      return acc
    }, [] as any).sort((a, b) => (a.code ?? '')?.localeCompare(b.code ?? ''))

    allCars = allCars.map(car => {
      const fuelData = nenpiKanriDataListByCar.find(v => v?.vehicle?.id === car.id)

      const OdometerInput = car.OdometerInput
      const myOdometerInput = OdometerInput.filter(v => {
        return v.userId === userId && !!v.odometerStart && !!v.odometerEnd
      })

      const soukouKyori = myOdometerInput.reduce((acc, cur, i) => {
        const diff = (cur.odometerEnd ?? 0) - (cur.odometerStart ?? 0)
        return acc + diff
      }, 0)
      const heikinNenpi = fuelData?.avgNempi ?? 0

      const nenryoiShiyoryo = soukouKyori && heikinNenpi ? soukouKyori / heikinNenpi : 0

      return {
        car,
        soukouKyori,
        heikinNenpi,
        nenryoiShiyoryo,
        ...fuelData,
      }
    })
    return {user, allCars}
  })
  type UserWithCarHistory = {
    user: User & {TbmVehicle: TbmVehicle}
    allCars: {
      car: TbmVehicle
      soukouKyori: number
      heikinNenpi: number
      nenryoiShiyoryo: number
      fuelCost: number
    }[]
  }

  return userListWithCarHistory as UserWithCarHistory[]
}
