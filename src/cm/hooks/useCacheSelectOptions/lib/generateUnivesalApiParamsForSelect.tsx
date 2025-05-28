'use client'

import {convertColIdToModelName} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/lib/MySelectMethods-server'
import {optionTakeCount} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/OptionSelector/OptionSelector'

import {GetCaheOptionSWR_REQUEST_PARAMS} from '@lib/server-actions/common-server-actions/serverGetCaheOptions'
import {forSelectConfig} from '@cm/types/types'
import {ForSelectConfig} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/Class/ForSelectConfig'

export const generateUnivesalApiParamsForSelect = ({col, latestFormData}) => {
  const config: forSelectConfig = col?.forSelect?.config ?? {}
  const modelName = config?.modelName ? config?.modelName : convertColIdToModelName({col})

  const {select, orderBy, where, include} = new ForSelectConfig(col, {latestFormData}).getConfig()

  const queryObject = {select, where, orderBy, take: optionTakeCount}

  if (include) {
    delete queryObject[`select`]
    queryObject[`include`] = include
  }

  const doStandardPrismaPasrams: GetCaheOptionSWR_REQUEST_PARAMS = {
    col,
    colId: col.id,
    model: modelName,
    method: 'findMany',
    queryObject,
  }

  return doStandardPrismaPasrams
}
