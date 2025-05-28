import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export const TbmRouteGroupUpsertController = {
  executeUpdate: async item => {
    const {
      id = 0,
      tbmCustomerId,
      tbmProductId,
      name,
      routeName,
      pickupTime,
      vehicleType,
      seikyuKbn,
      tbmBaseId,
      code,

      ...rest
    } = item.latestFormData

    const basezPayload = {
      code,
      name,
      tbmBaseId,
      routeName,
      pickupTime,
      vehicleType,
      seikyuKbn,
    }

    const {Mid_TbmRouteGroup_TbmCustomer, Mid_TbmRouteGroup_TbmProduct} = item.latestFormData

    if (tbmCustomerId === null) {
      const currentMid = item.latestFormData.Mid_TbmRouteGroup_TbmCustomer?.id

      if (currentMid) {
        const deleteRes = await doStandardPrisma(`mid_TbmRouteGroup_TbmCustomer`, `delete`, {where: {id: currentMid}})
        console.log(`mid_TbmRouteGroup_TbmCustomer`, {deleteRes})
      }
    }

    if (tbmProductId === null) {
      const currentMid = item.latestFormData.Mid_TbmRouteGroup_TbmProduct?.id
      if (currentMid) {
        const deleteRes = await doStandardPrisma(`mid_TbmRouteGroup_TbmProduct`, `delete`, {where: {id: currentMid}})
        console.log(`Mid_TbmRouteGroup_TbmProduct`, {deleteRes})
      }
    }

    const res = await doStandardPrisma(`tbmRouteGroup`, `upsert`, {
      where: {id: id},
      create: {
        ...basezPayload,
        Mid_TbmRouteGroup_TbmCustomer: tbmCustomerId ? {create: {tbmCustomerId}} : undefined,
        Mid_TbmRouteGroup_TbmProduct: tbmProductId ? {create: {tbmProductId}} : undefined,
      },
      update: {
        ...basezPayload,
        Mid_TbmRouteGroup_TbmCustomer: tbmCustomerId
          ? {
              upsert: {
                where: {id: Mid_TbmRouteGroup_TbmCustomer?.id ?? 0},
                create: {tbmCustomerId},
                update: {tbmCustomerId},
              },
            }
          : undefined,

        Mid_TbmRouteGroup_TbmProduct: tbmProductId
          ? {
              upsert: {
                where: {id: Mid_TbmRouteGroup_TbmProduct?.id ?? 0},
                create: {tbmProductId},
                update: {tbmProductId},
              },
            }
          : undefined,
      },
    })

    return res
  },
}
