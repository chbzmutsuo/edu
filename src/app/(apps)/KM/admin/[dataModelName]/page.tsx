import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {setCustomParams} from '@cm/components/DataLogic/TFs/Server/SetCustomParams'

import EasySearchAtomProvider from '@components/DataLogic/TFs/ClientConf/Providers/EasySearchAtomProvider'
import {PageBuilder} from '@app/(apps)/KM/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/KM/class/ColBuilder'
import {QueryBuilder} from '@app/(apps)/KM/class/QueryBuilder'

import {ViewParamBuilder} from '@app/(apps)/KM/class/ViewParamBuilder'
import {Conf} from '@components/DataLogic/TFs/Server/Conf'
import PropAdjustor from '@components/DataLogic/TFs/PropAdjustor/PropAdjustor'

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

const parameters = async (props: {params; query; session; scopes}) => {
  const {params, query, session, scopes} = props

  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: ['kaizenClient'],
        setParams: async () => {
          return {
            additional: {orderBy: [{public: 'desc'}]},
          }
        },
      },
      {
        modelNames: ['kaizenWork'],
        setParams: async () => {
          return {
            myForm: {
              style: {width: 1500},
            },
            additional: {
              orderBy: [{date: 'desc'}],
            },
          }
        },
      },
    ],
  })
  return customParams
}
