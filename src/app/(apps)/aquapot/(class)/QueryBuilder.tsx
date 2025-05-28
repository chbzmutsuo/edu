import {getIncludeType, includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'
import {Prisma} from '@prisma/client'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const user: Prisma.UserFindManyArgs = {}
    const aqProduct: Prisma.AqProductFindManyArgs = {
      include: {
        AqDefaultShiireAqCustomer: {},
        AqProductCategoryMaster: {},
        AqPriceOption: {},
        AqInventoryRegister: {},
        AqSaleRecord: {
          include: {
            AqCustomer: {},
          },
        },
      },
    }
    const aqCustomerPriceOption: Prisma.AqCustomerPriceOptionFindManyArgs = {
      include: {
        AqCustomer: {},
        AqPriceOption: {},
        AqProduct: {},
      },
    }
    const aqCustomer: Prisma.AqCustomerFindManyArgs = {
      include: {
        AqCustomerPriceOption: aqCustomerPriceOption,
        AqCustomerRecord: {},
        AqCustomerSupportGroupMidTable: {
          include: {AqSupportGroupMaster: {}},
        },
        AqCustomerServiceTypeMidTable: {
          include: {AqServiecTypeMaster: {}},
        },
        AqCustomerDealerMidTable: {
          include: {AqDealerMaster: {}},
        },
        AqCustomerDeviceMidTable: {
          include: {AqDeviceMaster: {}},
        },

        // AqSaleCart: {}, //履歴が膨らまないように、取得しない
      },
    }
    const aqCustomerSupportGroupMidTable: Prisma.AqCustomerSupportGroupMidTableFindManyArgs = {
      include: {AqSupportGroupMaster: {}},
    }

    const aqCustomerRecord: Prisma.AqCustomerRecordFindManyArgs = {
      include: {
        AqCustomerRecordAttachment: {},
        AqCustomer: {},
      },
    }
    const aqSaleRecord: Prisma.AqSaleRecordFindManyArgs = {
      include: {
        User: {},
        AqCustomer: {},
        AqSaleCart: {},
        AqProduct: {include: {AqPriceOption: {}}},
        AqPriceOption: {},
      },
    }
    const include: getIncludeType = {
      aqSaleRecord,
      user,
      aqProduct,
      aqCustomer,
      aqCustomerSupportGroupMidTable,
      aqCustomerPriceOption,
      aqCustomerRecord,
      aqInventoryRegister: {
        include: {AqCustomer: {}, AqProduct: {}},
      } as Prisma.AqInventoryRegisterFindManyArgs,
      aqCustomerSubscription: {
        include: {
          AqCustomer: {
            include: {
              AqCustomerPriceOption: {
                include: {AqPriceOption: {}},
              },
            },
          },
          AqProduct: {},
          AqDeviceMaster: {},
        },
      } as Prisma.AqCustomerSubscriptionFindManyArgs,
    }

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}
