'use client'

import {ViewParamBuilderProps} from '@components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

export class ViewParamBuilder {
  static tbmOperationGroup: ViewParamBuilderProps = props => {
    return {
      myForm: {
        create: {
          executeUpdate: async props => {
            // const data = {...props.latestFormData}
            // const {userId, tbmBaseId, tbmVehicleId, fuelOwn, fuelOther, confirmed, id} = data

            // const go: any = {}
            // const back: any = {}
            // Object.keys(props.latestFormData).forEach(key => {
            //   if (key.includes('go_')) {
            //     go[key.replace('go_', '')] = props.latestFormData[key]
            //     delete props.latestFormData[key]
            //   } else if (key.includes('back_')) {
            //     back[key.replace('back_', '')] = props.latestFormData[key]
            //     delete props.latestFormData[key]
            //   }
            // })

            // const {result: tbmOperation} = await doStandardPrisma(`tbmOperationGroup`, 'upsert', {
            //   where: {id},
            //   ...createUpdate({userId, tbmBaseId, tbmVehicleId, fuelOwn, fuelOther, confirmed}),
            // })

            // const operationPayload = {
            //   tbmOperationGroupId: tbmOperation.id,
            //   userId: data.userId,
            // }

            // if (go.tbmRouteGroupId) {
            //   const GoRouteRes = await doStandardPrisma(`tbmOperation`, 'upsert', {
            //     where: {
            //       unique_tbmRouteGroup_type: {
            //         tbmRouteGroupId: go.tbmRouteGroupId,
            //         type: 'go',
            //       },
            //     },
            //     create: {...go, ...operationPayload, type: 'go'},
            //     update: {...go, ...operationPayload, type: 'go'},
            //   })
            // }

            // if (back.tbmRouteGroupId) {
            //   const BackRouteRes = await doStandardPrisma(`tbmOperation`, 'upsert', {
            //     where: {
            //       unique_tbmRouteGroup_type: {
            //         tbmRouteGroupId: back.tbmRouteGroupId,
            //         type: 'back',
            //       },
            //     },
            //     create: {...back, ...operationPayload, type: 'back'},
            //     update: {...back, ...operationPayload, type: 'back'},
            //   })
            // }
            // const result = {
            //   ...tbmOperation,
            // }

            // toastByResult(tbmOperation)

            return {
              success: true,
              message: '保存しました',
              result: {},
            }
          },
        },
      },
    }
  }
}
