import {StrHandler} from '@class/StrHandler'
import {fetchAlt} from '@lib/http/fetch-client'

import {basePath} from '@lib/methods/common'
import {getSchema} from '@lib/methods/prisma-schema'
import {getScopes} from 'src/non-common/scope-lib/getScopes'

export const FakeOrKeepSession = async ({query, realSession}) => {
  const tempScopes = getScopes(realSession, {query})
  const globalUserId = tempScopes.getGlobalUserId()
  const globalKeys = Object.keys(query ?? {}).filter(key => key.includes('g_'))

  const models = globalKeys.map(key => key.replace(/g_|Id/g, ''))
  const schema = getSchema()

  let fakeUser: any = null

  for (let i = 0; i < models.length; i++) {
    const model = models[i]

    const isValidModel = schema[StrHandler.capitalizeFirstLetter(model)]

    if (!isValidModel) continue

    const payload = {
      model: model,
      method: `findUnique`,
      queryObject: {
        where: {id: Number(globalUserId ?? 0)},
      },
      fetchKey: 'middleware fetching',
    }

    if (fakeUser === null && !!globalUserId) {
      const res = await fetchAlt(`${basePath}/api/prisma/universal`, payload)

      const {result: data} = res ?? {}
      fakeUser = data
      return data
    } else {
      continue
    }
  }

  // const getFakeUsers: any = await Promise.all(
  //   models.map(async model => {
  //     const isValidModel = schema[StrHandler.capitalizeFirstLetter(model)]
  //     if (!isValidModel) return undefined

  //     const payload = {
  //       model: model,
  //       method: `findUnique`,
  //       queryObject: {
  //         where: {id: Number(globalUserId ?? 0)},
  //       },
  //       fetchKey: 'middleware fetching',
  //     }

  //     if (fakeUser === null && !!globalUserId) {
  //       const res = await fetchAlt(`${basePath}/api/prisma/universal`, payload)

  //       const {result: data} = res ?? {}
  //       return data
  //     } else {
  //       return undefined
  //     }
  //   })
  // )
  // fakeUser = getFakeUsers.find(u => u)

  const result = {...(fakeUser ?? realSession), role: realSession?.role}

  // return {...result, ...(tempScopes?.admin ? {role: '管理者'} : {})}
  return result
}
