//classを切り替える

import {setCustomParams} from '@cm/components/DataLogic/helpers/SetCustomParams'

import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {PageBuilder} from '@app/(apps)/shinsei/(builders)/PageBuilder'
import {ColBuilder} from '@app/(apps)/shinsei/(builders)/ColBuilder'
import {QueryBuilder} from '@app/(apps)/shinsei/(builders)/QueryBuilder'

import {ViewParamBuilder} from '@app/(apps)/shinsei/(builders)/ViewParamBuilder'
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
        modelNames: [`user`],
        setParams: async () => {
          return {
            additional: {
              payload: {apps: [`shinsei`]},
              where: {apps: {has: `shinsei`}},
              orderBy: [{code: 'asc'}, {departmentId: 'asc'}],
            },
          }
        },
      },
      {
        modelNames: [`product`, 'shiireSaki'],
        setParams: async () => {
          return {
            myTable: {
              pagination: {countPerPage: 100},
            },
            additional: {
              orderBy: [{code: 'asc'}],
            },
          }
        },
      },
    ],
  })
  return customParams
}
