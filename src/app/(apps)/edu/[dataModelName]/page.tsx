//classを切り替える

import {setCustomParams} from '@components/DataLogic/helpers/SetCustomParams'

import {getScopes} from 'src/non-common/scope-lib/getScopes'

import {PageBuilder} from '@app/(apps)/edu/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/edu/class/ColBuilder'
import {QueryBuilder} from '@app/(apps)/edu/class/QueryBuilder'
import {ViewParamBuilder} from '@app/(apps)/edu/class/ViewParamBuilder'
import {getMasterPageCommonConfig} from '@components/DataLogic/helpers/getMasterPageCommonConfig'

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
