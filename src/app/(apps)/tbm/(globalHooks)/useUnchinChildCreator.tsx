import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import {useGlobalModalForm} from '@components/utils/modal/useGlobalModalForm'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {atomKey} from '@hooks/useJotai'
import React from 'react'

export default function useUnchinChildCreator() {
  type gasolineGMF = {
    TbmRouteGroup: any
  }

  return useGlobalModalForm<gasolineGMF>(`useUnchinChildCreatorGMF` as atomKey, null, {
    mainJsx: ({GMF_OPEN, setGMF_OPEN}) => {
      const useGlobalProps = useGlobal()
      const {TbmRouteGroup} = GMF_OPEN ?? {}

      return (
        <>
          <ChildCreator
            {...{
              ParentData: TbmRouteGroup,
              models: {parent: `tbmRouteGroup`, children: `tbmRouteGroupFee`},
              additional: {
                orderBy: [{startDate: `desc`}],
              },

              columns: ColBuilder.tbmRouteGroupFee({useGlobalProps}),

              useGlobalProps,
            }}
          />
        </>
      )
    },
  })
}
