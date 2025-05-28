import {aqCustomerForSelectConfig} from '@app/(apps)/aquapot/(class)/colBuilder/aqCustomer'
import {AQ_CONST} from '@app/(apps)/aquapot/(constants)/options'
import {colType} from '@cm/types/types'
import {Prisma} from '@prisma/client'

export class AqCustomerCl {
  static Filter = {
    aqCustomer: {
      getCols: () => {
        const cols: colType[] = [
          {
            id: `AqDealer`,
            label: `担当販売店`,
            form: {},
            forSelect: {
              config: {
                modelName: `aqDealerMaster`,
              },
            },
          },
          {
            id: `AqDevice`,
            label: `ご利用機種`,
            form: {},
            forSelect: {
              config: {
                modelName: `aqDeviceMaster`,
              },
            },
          },
          {
            id: `AqServiceType`,
            label: `ご利用サービス`,
            form: {},
            forSelect: {
              config: {
                modelName: `aqServiecTypeMaster`,
              },
            },
          },
          {
            id: `customerStatus`,
            label: `ステータス`,
            form: {},
            forSelect: {
              optionsOrOptionFetcher: AQ_CONST.CUSTOMER.AQCUSTOMER_STATUS_LIST,
            },
          },
          {
            id: `AqSupportGroup`,
            label: `支援団体`,
            form: {},
            forSelect: {
              config: {
                modelName: `aqSupportGroupMaster`,
              },
            },
          },
        ]
        return cols
      },

      getPrismaWhereByQuery: ({query}) => {
        const columns = AqCustomerCl.Filter.aqCustomer.getCols()
        const keys = columns.map(d => d.id)

        const where: Prisma.AqCustomerWhereInput = {}
        if (query.name) {
          where[`name`] = {contains: query.name}
        }

        if (query.customerStatus) {
          where.status = query.customerStatus
        }

        const today = new Date()
        if (query.AqSupportGroup) {
          where.AqCustomerSupportGroupMidTable = {
            some: {
              from: {lte: today},
              OR: [
                //
                {to: null},
                {to: {gte: today}},
              ],
              AqSupportGroupMaster: {
                id: Number(query.AqSupportGroup),
              },
            },
          }
        }

        if (query.AqServiceType) {
          where.AqCustomerServiceTypeMidTable = {some: {aqServiecTypeMasterId: Number(query.AqServiceType)}}
        }
        if (query.AqDealer) {
          where.AqCustomerDealerMidTable = {some: {aqDealerMasterId: Number(query.AqDealer)}}
        }
        if (query.AqDevice) {
          where.AqCustomerDeviceMidTable = {some: {aqDeviceMasterId: Number(query.AqDevice)}}
        }

        return where
      },
    },
    aqCustomerRecord: {
      getCols: () => {
        const cols: colType[] = [
          {
            id: `aqCustomerId`,
            label: `法人名 / 顧客名`,
            forSelect: {
              config: aqCustomerForSelectConfig,
            },
          },

          {
            id: `customerStatus`,
            label: `ステータス`,
            form: {},
            forSelect: {
              optionsOrOptionFetcher: AQ_CONST.CUSTOMER.AQCUSTOMER_RECORD_STATUS_LIST,
            },
          },
          {
            id: `type`,
            label: `区分`,
            form: {},
            forSelect: {
              optionsOrOptionFetcher: AQ_CONST.CUSTOMER.AQCUSTOMER_RECORD_TYPE_LIST,
            },
            search: {},
          },
          {
            id: `userId`,
            label: `対応者`,
            form: {},
            forSelect: {},
            search: {},
          },
        ]
        return cols
      },

      getPrismaWhereByQuery: ({query}) => {
        const columns = AqCustomerCl.Filter.aqCustomer.getCols()

        const where: Prisma.AqCustomerRecordWhereInput = {}

        if (query.aqCustomerId) {
          where.aqCustomerId = Number(query.aqCustomerId)
        }
        if (query.customerStatus) {
          where.status = query.customerStatus
        }
        if (query.type) {
          where.type = query.type
        }
        if (query.userId) {
          where.userId = Number(query.userId)
        }

        return where
      },
    },
  }
}
