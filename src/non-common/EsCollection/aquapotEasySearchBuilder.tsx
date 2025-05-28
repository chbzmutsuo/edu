import {
  EasySearchObject,
  EasySearchObjectExclusiveGroup,
  easySearchType,
  Ex_exclusive0,
  makeEasySearchGroups,
  makeEasySearchGroupsProp,
  toRowGroup,
} from '@cm/class/builders/QueryBuilderVariables'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {AqCustomerSupportGroupMidTable, AqSupportGroupMaster, Prisma} from '@prisma/client'

export const aquapotEasySearchBuilder = async () => {
  // const aqSaleRecord = async (props: easySearchType) => {
  //   type exclusiveKeyStrings = 'foo' | `support`
  //   type CONDITION_TYPE = Prisma.AqSaleRecordWhereInput
  //   type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings, CONDITION_TYPE>
  //   const {session, query, dataModelName, easySearchExtraProps} = props
  //   const {whereQuery} = easySearchExtraProps ?? {}

  //   type keys = {
  //     [key in string]: EasySearchObject
  //   }

  //   const {result: AqSupportGroupMaster} = await doStandardPrisma(`aqSupportGroupMaster`, `findMany`, {
  //     include: {
  //       AqCustomerSupportGroupMidTable: {},
  //     },
  //   })
  //   const AqCustomerSupportGroupMidTableOfCsustomer: (AqCustomerSupportGroupMidTable & {
  //     AqSupportGroupMaster: AqSupportGroupMaster
  //   })[] = easySearchExtraProps?.AqCustomerSupportGroupMidTable

  //   const Ex_SupportOrganization: exclusiveGroups = Object.fromEntries(
  //     AqSupportGroupMaster.map(org => {
  //       const key = `support-${org.id}`

  //       const {from, to} = AqCustomerSupportGroupMidTableOfCsustomer.find(d => d.aqSupportGroupMasterId === org.id) ?? {}

  //       const CONDITON: Prisma.AqSaleRecordWhereInput = {
  //         id: !from ? 0 : undefined,
  //         date: {
  //           gte: from,
  //           lte: to || undefined,
  //         },

  //         // AqCustomer: {
  //         //   AqCustomerSupportGroupMidTable: {
  //         //     some: {
  //         //       id: {in: easySearchExtraProps?.AqCustomerSupportGroupMidTable?.map(d => d.id)},
  //         //       // from: whereQuery.gte,
  //         //       // to: whereQuery.lt,
  //         //     },
  //         //   },
  //         // },
  //       }

  //       // const periodWhere=
  //       const value = {label: org.name, CONDITION: CONDITON}

  //       return [key, value]
  //     })
  //   )

  //   const dataArr: makeEasySearchGroupsProp[] = []
  //   toRowGroup(1, dataArr, [
  //     //
  //     {exclusiveGroup: Ex_exclusive0, name: `全て`, additionalProps: {refresh: true}},
  //     {exclusiveGroup: Ex_SupportOrganization, name: `支援団体別`, additionalProps: {refresh: true}},
  //   ])
  //   const result = makeEasySearchGroups(dataArr) as keys

  //   return result
  // }
  const aqCustomer = async (props: easySearchType) => {
    'use server'

    type exclusiveKeyStrings = 'normal' | 'fromBase'
    type CONDITION_TYPE = Prisma.AqCustomerWhereInput
    type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings, CONDITION_TYPE>
    const {session, query, dataModelName, easySearchExtraProps} = props
    const {whereQuery} = easySearchExtraProps ?? {}

    type keys = {
      [key in string]: EasySearchObject
    }

    const Ex_SupportOrganization: exclusiveGroups = {
      normal: {label: `通常`, CONDITION: {fromBase: false}},
      fromBase: {label: `BASEから`, CONDITION: {fromBase: true}},
    }

    const dataArr: makeEasySearchGroupsProp[] = []
    toRowGroup(1, dataArr, [
      //
      {exclusiveGroup: Ex_exclusive0, name: `全て`, additionalProps: {refresh: true}},
      {exclusiveGroup: Ex_SupportOrganization, name: `区分`, additionalProps: {refresh: true}},
    ])
    const result = makeEasySearchGroups(dataArr) as keys

    return result
  }
  return {
    // aqSaleRecord,
    aqCustomer,
  }
}
