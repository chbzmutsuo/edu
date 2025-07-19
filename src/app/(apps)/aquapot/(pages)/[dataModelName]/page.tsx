//classを切り替える

import {setCustomParams} from '@cm/components/DataLogic/helpers/SetCustomParams'
import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {PageBuilder} from '@app/(apps)/aquapot/(class)/Pagebuilder/PageBuilder'
import {ColBuilder} from '@app/(apps)/aquapot/(class)/colBuilder/ColBuilder'
import {QueryBuilder} from '@app/(apps)/aquapot/(class)/QueryBuilder'

import {ViewParamBuilder} from '@app/(apps)/aquapot/(class)/ViewParamBuilder'
import {AqCustomerCl} from '@app/(apps)/aquapot/(models)/AqCustomerCl'
import {getMasterPageCommonConfig} from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'

const getBuilders = () => ({ColBuilder, ViewParamBuilder, PageBuilder, QueryBuilder})
export default async function DynamicMasterPage(props) {
  return getMasterPageCommonConfig({
    nextPageProps: props,
    parameters,
    ColBuilder,
    ViewParamBuilder,
    PageBuilder,
    QueryBuilder,
  })
}

const parameters = async (props: {params; query; session; scopes: ReturnType<typeof getScopes>}) => {
  const {params, query, session, scopes} = props
  const {admin} = scopes

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`user`],
        setParams: async () => {
          return {
            additional: {
              where: {apps: {has: `aquapot`}},

              payload: {apps: [`aquapot`]},
            },
          }
        },
      },
      {
        modelNames: [`aqProduct`],
        setParams: async () => ({
          additional: {orderBy: [{productCode: 'asc'}]},
          myTable: {},
        }),
      },
      {
        modelNames: [`aqCustomerSubscription`],
        setParams: async () => ({
          additional: {
            orderBy: [
              //
              {aqCustomerId: `asc`},
            ],
          },
          myTable: {},
        }),
      },

      {
        modelNames: [`aqCustomer`],

        setParams: async () => {
          const customerFilterWhere = AqCustomerCl.Filter.aqCustomer.getPrismaWhereByQuery({query})

          return {
            editType: {type: `pageOnSame`},

            additional: {
              orderBy: [{customerNumber: 'desc'}],
              where: {...customerFilterWhere},
            },
          }
        },
      },
      {
        modelNames: [`aqCustomerRecord`],
        setParams: async () => {
          const customerRecordFilterWhere = AqCustomerCl.Filter.aqCustomerRecord.getPrismaWhereByQuery({query})
          return {
            editType: {type: `pageOnSame`},
            additional: {
              where: {...customerRecordFilterWhere},
              orderBy: [{createdAt: 'desc'}],
            },
          }
        },
      },
      {
        modelNames: [`aqInventoryRegister`],
        setParams: async () => {
          const customerRecordFilterWhere = AqCustomerCl.Filter.aqCustomerRecord.getPrismaWhereByQuery({query})
          return {
            additional: {
              orderBy: [{createdAt: 'desc'}],
            },
          }
        },
      },
    ],
  })
  return customParams
}
