import {ViewParamBuilderProps} from '@components/DataLogic/TFs/PropAdjustor/usePropAdjustorProps'

export const useMergeWithCustomViewParams = ClientProps => {
  const {dataModelName, ViewParamBuilder} = ClientProps ?? {}
  const CustomViewParamsMethod: ViewParamBuilderProps = ViewParamBuilder?.[dataModelName]

  const CustomViewParams = CustomViewParamsMethod?.({ClientProps2: ClientProps})

  Object.keys(CustomViewParams ?? {}).forEach(key => {
    ClientProps[key] = {
      ...ClientProps[key],
      ...CustomViewParams[key],
    }
  })

  return ClientProps
}
