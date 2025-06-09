//classを切り替える

import {setCustomParams} from '@components/DataLogic/helpers/SetCustomParams'

import {getScopes} from 'src/non-common/scope-lib/getScopes'

import {PageBuilder} from '@app/(apps)/sohken/class/PageBuilder'
import {ColBuilder} from '@app/(apps)/sohken/class/ColBuilder'
import {QueryBuilder} from '@app/(apps)/sohken/class/QueryBuilder'
import {ViewParamBuilder} from '@app/(apps)/sohken/class/ViewParamBuilder'

import {Days} from '@class/Days/Days'
import {toUtc} from '@class/Days/date-utils/calculations'
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
  const {admin} = scopes
  //---------------個別設定-------------
  const customParams = await setCustomParams({
    dataModelName: params.dataModelName,
    variants: [
      {
        modelNames: [`genbaDay`],
        setParams: async () => {
          const genbaId = query.genbaId ? Number(query.genbaId) : undefined
          const queryFrom = query.from ? toUtc(query.from) : null
          const queryTo = query.to ? toUtc(query.to) : null
          const whereQuery =
            queryFrom && queryTo
              ? {
                  date: {gte: queryFrom, lte: queryTo},
                }
              : queryFrom
                ? {
                    date: {gte: queryFrom, lt: Days.day.add(queryFrom, 1)},
                  }
                : {}

          return {
            myTable: {
              pagination: {countPerPage: 50},
              style: {maxWidth: `95vw`},

              header: false,
            },
            additional: {
              orderBy: [{Genba: {PrefCity: {sortOrder: `asc`}}}, {date: `asc`}],
              where: {
                OR: [{status: {not: `不要`}}, {status: null}],
                ...whereQuery,
                genbaId,
              },
            },
          }
        },
      },
      {
        modelNames: [`user`],
        setParams: async () => {
          return {
            myTable: {
              drag: {},
              pagination: {countPerPage: 50},
            },

            additional: {
              where: {OR: [{app: `sohken`}, {apps: {has: `sohken`}}]},
              payload: {app: `sohken`, apps: [`sohken`]},
            },
          }
        },
      },
      {
        modelNames: [`sohkenCar`],
        setParams: async () => {
          return {myTable: {drag: {}}}
        },
      },
      {
        modelNames: [`genba`],
        setParams: async () => {
          return {
            myTable: {
              pagination: {countPerPage: 30},
            },
            editType: {type: `pageOnSame`},
            additional: {orderBy: [{PrefCity: {sortOrder: `asc`}}]},
          }
        },
      },
      {
        modelNames: [`prefCity`],
        setParams: async () => {
          return {
            myTable: {
              drag: {},
              pagination: {countPerPage: 100},
            },
          }
        },
      },
      {
        modelNames: [`roleMaster`],
        setParams: async () => ({
          myTable: {
            create: admin,
            update: admin,
            delete: admin,
          },
        }),
      },
      {
        modelNames: [`genbaTaskMaster`],
        setParams: async () => ({
          myTable: {
            drag: {},
            pagination: {countPerPage: 999999},
          },
        }),
      },
    ],
  })
  return customParams
}
