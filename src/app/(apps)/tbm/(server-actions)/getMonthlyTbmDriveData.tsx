'use server'
export type meisaiKey =
  | `date`
  | `routeCode`
  | `routeName`
  | `vehicleType`
  | `productName`
  | `customerCode`
  | `customerName`
  | `vehicleTypeCode`
  | `plateNumber`
  | `driverCode`
  | `driverName`
  | `N_postalFee`
  | `O_postalHighwayFee`
  | `P_generalFee`
  | `Q_generalHighwayFee`
  | `U_jomuinFutan`
  | `S_driverFee`
  | `T_JomuinUnchin`
  | `U_jomuinFutan`
  | `V_thirteenPercentOfPostalHighway`
  | `W_general`
  | `X_highwayExcess`
  | `Y_remarks`
  | `Z_orderNumber`

export type tbmTableKeyValue = {
  type?: any
  label: string
  cellValue?: number | string | Date | null
  style?: {
    width?: number
    minWidth?: number
    backgroundColor?: string
  }
}

type userType = User & {TbmVehicle?: TbmVehicle}
export type MonthlyTbmDriveData = {
  schedule: TbmDriveSchedule & {User: userType; TbmVehicle: TbmVehicle}
  keyValue: {
    [key in meisaiKey]: tbmTableKeyValue
  }
}

import prisma from 'src/lib/prisma'
import {TbmDriveSchedule, TbmVehicle, User} from '@prisma/client'

export const getMonthlyTbmDriveData = async ({whereQuery, tbmBaseId}) => {
  const ConfigForMonth = await prisma.tbmMonthlyConfigForRouteGroup.findFirst({
    where: {
      yearMonth: whereQuery.gte,
      TbmRouteGroup: {tbmBaseId: tbmBaseId},
    },
  })
  const tbmDriveSchedule = await prisma.tbmDriveSchedule.findMany({
    where: {
      approved: true,
      date: whereQuery,
      tbmBaseId,
    },
    orderBy: [{date: 'asc'}, {createdAt: 'asc'}, {userId: 'asc'}],
    include: {
      // TbmEtcMeisai:{},
      TbmRouteGroup: {
        include: {
          TbmMonthlyConfigForRouteGroup: {
            where: {yearMonth: whereQuery.gte},
          },
          Mid_TbmRouteGroup_TbmCustomer: {include: {TbmCustomer: {}}},
        },
      },
      TbmVehicle: {},
      User: {
        include: {
          TbmVehicle: {},
        },
      },
    },
  })

  const monthlyTbmDriveList: MonthlyTbmDriveData[] = tbmDriveSchedule.map(schedule => {
    const jitsudoKaisu = 1
    const ConfigForRoute = schedule.TbmRouteGroup.TbmMonthlyConfigForRouteGroup.find(
      config => config.tbmRouteGroupId === schedule.TbmRouteGroup.id
    )

    const S_driverFee = 99999

    const N_postalFee = (ConfigForRoute?.tsukoryoSeikyuGaku ?? 0) / jitsudoKaisu
    const O_postalHighwayFee = schedule.O_postalHighwayFee ?? 0

    const P_generalFee = ConfigForRoute?.generalFee ?? 0
    const Q_generalHighwayFee = schedule.Q_generalHighwayFee ?? 0

    const V_thirteenPercentOfPostalHighway = O_postalHighwayFee * 0.3
    const U_jomuinFutan = O_postalHighwayFee - (N_postalFee + V_thirteenPercentOfPostalHighway)
    const W_general = Q_generalHighwayFee - P_generalFee
    const T_JomuinUnchin = S_driverFee - (V_thirteenPercentOfPostalHighway + W_general)

    const Customer = schedule.TbmRouteGroup?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer

    return {
      schedule: schedule as TbmDriveSchedule & {User: userType; TbmVehicle: TbmVehicle},

      keyValue: {
        date: {
          type: 'date',
          label: '運行日',
          cellValue: schedule.date,
        },
        routeCode: {
          label: '便CD',
          cellValue: schedule.TbmRouteGroup.code,
        },
        routeName: {
          label: '便名',
          cellValue: schedule.TbmRouteGroup.name,
          style: {minWidth: 160},
        },
        vehicleType: {
          label: '車種',
          cellValue: schedule.TbmVehicle?.type,
        },

        productName: {
          label: '品名',
          cellValue: schedule.TbmRouteGroup.productName,
          style: {minWidth: 120},
        },
        customerCode: {
          label: '取引先CD',
          cellValue: Customer?.code,
        },
        customerName: {
          label: '取引先',
          cellValue: Customer?.name,
          style: {minWidth: 240},
        },
        vehicleTypeCode: {
          label: '車種CD',
          cellValue: 'コード',
        },
        plateNumber: {
          label: '車番',
          cellValue: schedule.TbmVehicle?.vehicleNumber,
        },
        driverCode: {
          label: '運転手CD',
          cellValue: 'コード',
        },
        driverName: {
          label: '運転手',
          cellValue: schedule.User?.name,
        },
        N_postalFee: {
          label: '通行料(郵便)',
          cellValue: N_postalFee,
          style: {backgroundColor: '#fcdede'},
        },
        O_postalHighwayFee: {
          label: '高速代（郵便）',
          cellValue: O_postalHighwayFee,
          style: {backgroundColor: '#fcdede'},
        },
        P_generalFee: {
          label: '通行料(一般)',
          cellValue: P_generalFee,
          style: {backgroundColor: '#deebfc'},
        },
        Q_generalHighwayFee: {
          label: '高速代（一般）',
          cellValue: Q_generalHighwayFee,
          style: {backgroundColor: '#deebfc'},
        },
        R_KosokuShiyu: {
          label: '高速使用代',
          cellValue: U_jomuinFutan,
        },
        S_driverFee: {
          label: '運賃',
          cellValue: S_driverFee,
        },
        T_JomuinUnchin: {
          label: '給与算定運賃',
          cellValue: T_JomuinUnchin,
          style: {backgroundColor: '#defceb'},
        },
        U_jomuinFutan: {
          label: ['乗務員負担', '高速代-(通行料+30％)'].join(`\n`),
          cellValue: U_jomuinFutan,
          style: {backgroundColor: '#defceb'},
        },
        V_thirteenPercentOfPostalHighway: {
          label: ['運賃から負担', '高速代の30％'].join(`\n`),
          cellValue: V_thirteenPercentOfPostalHighway,
          style: {backgroundColor: '#defceb'},
        },
        W_general: {
          label: '高速代-通行料',
          cellValue: W_general,
          style: {backgroundColor: '#9ec1ff'},
        },
        X_highwayExcess: {
          label: '高速超過分',
          cellValue: 0,
        },
        Y_remarks: {
          label: '備考',
          cellValue: '要検討',
        },
        Z_orderNumber: {
          label: '発注書NO',
          cellValue: '要検討',
        },
      },
    }
  })

  const userList: userType[] = monthlyTbmDriveList
    .reduce((acc, row) => {
      const {schedule} = row
      const {User} = schedule
      if (acc.find(user => user.id === User.id)) {
        return acc
      }
      acc.push(User)
      return acc
    }, [] as userType[])
    .sort((a, b) => -String(a.code ?? '').localeCompare(String(b.code ?? '')))

  return {monthlyTbmDriveList, ConfigForMonth, userList}
}
