//classを切り替える

import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {setCustomParams} from '@cm/components/DataLogic/TFs/Server/SetCustomParams'

import {getScopes} from 'src/non-common/scope-lib/getScopes'
import {Conf} from '@components/DataLogic/TFs/Server/Conf'

import PropAdjustor from '@components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import EasySearchAtomProvider from '@components/DataLogic/TFs/ClientConf/Providers/EasySearchAtomProvider'
import {PageBuilder} from '@app/(apps)/Grouping/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/Grouping/class/ColBuilder'
import {QueryBuilder} from '@app/(apps)/Grouping/class/QueryBuilder'
import {ViewParamBuilder} from '@app/(apps)/Grouping/class/ViewParamBuilder'

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

  //---------------個別設定-------------
  const {schoolId, teacherId} = scopes.getGroupieScopes()
  const commonAdditionalProps = {
    where: {schoolId: schoolId},
    payload: {schoolId: schoolId},
  }
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,

    variants: [
      {
        modelNames: [`teacher`, 'subjectNameMaster', 'classroom', 'student'],
        setParams: async () => ({
          additional: {
            ...commonAdditionalProps,
          },
        }),
      },

      {
        modelNames: ['user'],
        setParams: async () => ({
          dataModelName: 'teacher',
          ...commonAdditionalProps,
        }),
      },

      {
        modelNames: ['roombackups'],
        setParams: async () => {
          return {
            additional: {
              where: {schoolId: schoolId, teacherId: teacherId ?? 0},
              payload: {schoolId: schoolId, teacherId: teacherId ?? 0},
            },
            surroundings: {
              top: {
                class: PageBuilder,
                getter: 'RoomMarkDown',
              },
            },
          }
        },
      },
    ],
  })
  return customParams
}
