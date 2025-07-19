//classを切り替える

import {setCustomParams} from '@cm/components/DataLogic/helpers/SetCustomParams'

import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {PageBuilder} from '@app/(apps)/tbm/(builders)/PageBuilders/PageBuilder'
import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import {QueryBuilder} from '@app/(apps)/tbm/(builders)/QueryBuilder'

import {ViewParamBuilder} from '@app/(apps)/tbm/(builders)/ViewParamBuilder'
import {getMasterPageCommonConfig} from '@cm/components/DataLogic/helpers/getMasterPageCommonConfig'

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

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`tbmRefuelHistory`, `tbmRouteGroup`],
        setParams: async () => {
          return {
            additional: {
              orderBy: [
                //
                {date: 'asc'},
              ],
            },
          }
        },
      },

      {
        modelNames: [`user`],
        setParams: async () => {
          return {
            additional: {
              where: {apps: {has: `tbm`}},
              payload: {apps: [`tbm`]},
              orderBy: [{TbmBase: {code: 'asc'}}, {code: 'asc'}],
            },
          }
        },
      },

      {
        modelNames: [`tbmBase`],
        setParams: async () => {
          return {
            // editType: {type: `pageOnSame`},
          }
        },
      },
      {
        modelNames: [`tbmVehicle`],
        setParams: async () => {
          return {
            additional: {
              orderBy: [{vehicleNumber: 'asc'}],
            },

            editType: {type: `pageOnSame`},
          }
        },
      },
    ],
  })
  return customParams
}
1
