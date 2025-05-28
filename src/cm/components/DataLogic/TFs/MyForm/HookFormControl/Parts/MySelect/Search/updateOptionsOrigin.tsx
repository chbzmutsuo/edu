import {generalDoStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {optionType} from 'src/cm/class/Fields/col-operator-types'
import {ForSelectConfig} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/Class/ForSelectConfig'
import {OrSearchArray} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/Class/OrSearchArray'

import {scaleUpWhereQueryForOptionSearch} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/lib/MySelectMethods-client'
import {mapAdjustOptionValue} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/lib/MySelectMethods-server'
import {contextsType} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/my-select-types'
import {generateUnivesalApiParamsForSelect} from 'src/cm/hooks/useCacheSelectOptions/lib/generateUnivesalApiParamsForSelect'

export const updateOptionsOrigin = async ({input, options, isStaticOptions, contexts}) => {
  const {controlContextValue, MySelectContextValue} = contexts as contextsType
  const {setsearchedInput, setFilteredOptions} = MySelectContextValue
  const {col, latestFormData} = controlContextValue

  setsearchedInput(input)
  let hits: optionType[] = []
  if (isStaticOptions === false) {
    hits = await getHitsByFetch()
    console.debug(`getHitsByFetch`, hits)
  }

  if (hits.length === 0) {
    hits = await getHitsFromOptions()
    console.debug(`getHitsFromOptions`, hits)
  }

  setFilteredOptions(hits)

  async function getHitsFromOptions() {
    const firstFilter: optionType[] = (options ?? []).filter(option => {
      const inputVersions = OrSearchArray.getLetterVariationArr(input)

      const hit = inputVersions.find(obj => {
        const {value, type} = obj

        const optionNameILowerCase = String(option?.['name'])?.toLowerCase()
        const searchValueInLowerCase = String(value).toLowerCase()
        const isHit = optionNameILowerCase.includes(searchValueInLowerCase)
        return isHit
      })

      return hit
    })

    return firstFilter
  }

  async function getHitsByFetch() {
    try {
      const UnivesalApiParamsForSelect = generateUnivesalApiParamsForSelect({col, latestFormData})
      const {model, method, queryObject} = UnivesalApiParamsForSelect

      const {selectWithColType, where, nameChanger} = new ForSelectConfig(col, {latestFormData}).getConfig()

      const searchNotationVersions = OrSearchArray.getLetterVariationArr(input)

      const AND = scaleUpWhereQueryForOptionSearch({where, select: selectWithColType, searchNotationVersions})

      queryObject[`where`] = {AND}

      queryObject[`take`] = undefined
      const payload = {model: model, method, queryObject}

      // //doStandardPrismaを使うと、なぜかサイレンダリングが起き、モーダルが閉じる
      // const res = await fetchAlt(`${basePath}/api/prisma/universal`, payload)
      const res = await generalDoStandardPrisma(model, method, queryObject)

      const {result = [], message} = res

      let newOptions: optionType[] = result

      if (nameChanger) {
        newOptions = newOptions.map(option => nameChanger(option))
      }

      newOptions = mapAdjustOptionValue(newOptions)
      return newOptions
    } catch (error) {
      return []
    }
  }
}
