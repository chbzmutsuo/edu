//classを切り替える

import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {setCustomParams} from '@cm/components/DataLogic/TFs/Server/SetCustomParams'

import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {Conf} from '@components/DataLogic/TFs/Server/Conf'
import PropAdjustor from '@components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import EasySearchAtomProvider from '@components/DataLogic/TFs/ClientConf/Providers/EasySearchAtomProvider'
import {PageBuilder} from '@app/(apps)/stock/(builders)/PageBuilder'
import {ColBuilder} from '@app/(apps)/stock/(builders)/ColBuilder'
import {QueryBuilder} from '@app/(apps)/stock/(builders)/QueryBuilder'

import {ViewParamBuilder} from '@app/(apps)/stock/(builders)/ViewParamBuilder'
import {getMidnight} from '@class/Days/date-utils/calculations'
import {getStockConfig} from 'src/non-common/EsCollection/(stock)/getStockConfig'
const getBuilders = () => ({ColBuilder, ViewParamBuilder, PageBuilder, QueryBuilder})
export default async function DynamicMasterPage(props) {
  const query = await props.searchParams
  const params = await props.params
  const {session, scopes} = await initServerComopnent({query})
  const customParams = await parameters({params, query, session, scopes})
  const conf = await Conf({params, session, query, customParams, ...getBuilders()})

  return (
    <EasySearchAtomProvider {...conf}>
      <PropAdjustor {...conf} />
    </EasySearchAtomProvider>
  )
}

const parameters = async (props: {params; query; session; scopes: ReturnType<typeof getScopes>}) => {
  const {params, query, session, scopes} = props

  const config = await getStockConfig()

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`stock`],
        setParams: async () => {
          return {
            ColBuilderExtraProps: {config},
            myTable: {
              className: `[&_td]:!p-0`,
              style: {maxWidth: `98vw`, padding: 0},
              create: false,
              delete: false,
              update: false,
              showRecordIndex: false,
              useWrapperCard: false,
            },
            additional: {
              orderBy: [
                //
                {favorite: `desc`},
                {profit: {sort: `desc`, nulls: `last`}},
                {last_riseRate: `desc`},
                {Code: `asc`},
              ],
            },
          }
        },
      },
      {
        modelNames: [`stockHistory`],
        setParams: async () => {
          return {
            ColBuilderExtraProps: {config},
            additional: {
              where: {
                Date: getMidnight(query.from ?? new Date()),
              },
              orderBy: [{Date: `desc`}, {Code: `asc`}],
            },
          }
        },
      },
    ],
  })
  return customParams
}
