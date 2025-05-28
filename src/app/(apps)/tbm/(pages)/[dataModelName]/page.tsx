//classを切り替える

import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {setCustomParams} from '@cm/components/DataLogic/TFs/Server/SetCustomParams'

import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {Conf} from '@components/DataLogic/TFs/Server/Conf'
import PropAdjustor from '@components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import {PageBuilder} from '@app/(apps)/tbm/(builders)/PageBuilders/PageBuilder'
import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import {QueryBuilder} from '@app/(apps)/tbm/(builders)/QueryBuilder'

import {ViewParamBuilder} from '@app/(apps)/tbm/(builders)/ViewParamBuilder'
const getBuilders = () => ({ColBuilder, ViewParamBuilder, PageBuilder, QueryBuilder})
export default async function DynamicMasterPage(props) {
  const query = await props.searchParams
  const params = await props.params

  const {session, scopes} = await initServerComopnent({query})
  const customParams = await parameters({params, query, session, scopes})
  const conf = await Conf({params, session, query, customParams, ...getBuilders()})

  return <PropAdjustor {...conf} />
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

            // editType: {type: `pageOnSame`},
          }
        },
      },
    ],
  })
  return customParams
}
1
