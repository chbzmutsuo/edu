import {forSelectConfig} from '@cm/types/select-types'
import {TbmVehicle} from '@prisma/client'

export class VehicleCl {
  tbmVehicle: TbmVehicle

  constructor(tbmVehicle: TbmVehicle) {
    this.tbmVehicle = tbmVehicle
  }

  get name() {
    const {type, shape, vehicleNumber} = this.tbmVehicle
    return [`[${type ?? '-'}]`, vehicleNumber, shape].filter(Boolean).join(` `)
  }

  get shortName() {
    const {type, shape, frameNo, vehicleNumber} = this.tbmVehicle
    return [`[${type ?? '-'}]`, vehicleNumber].filter(Boolean).join(` `)
  }

  static getVehicleForSelectConfig = ({tbmBaseId}: {tbmBaseId?: number}) => {
    const result: forSelectConfig = {
      where: ({latestFormData}) => {
        return {tbmBaseId: latestFormData?.tbmBaseId ?? tbmBaseId}
      },

      orderBy: [{id: `asc`}],
      select: {
        id: `number`,
        code: `string`,
        frameNo: `string`,
        vehicleNumber: `string`,
        type: `string`,
        shape: `string`,
        name: false,
      },
      nameChanger(op) {
        if (op) {
          const vehicle = op as unknown as TbmVehicle
          return {...op, name: new VehicleCl(vehicle).name}
        }

        return op
      },
    }

    return result
  }
}
