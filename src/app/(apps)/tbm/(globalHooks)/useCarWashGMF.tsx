import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import {useGlobalModalForm} from '@components/utils/modal/useGlobalModalForm'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {atomKey} from '@hooks/useJotai'
import React from 'react'

export default function useCarWashGMF() {
  type gasolineGMF = {
    TbmVehicle: any
  }

  return useGlobalModalForm<gasolineGMF>(`useCarWashGMF` as atomKey, null, {
    mainJsx: ({GMF_OPEN, setGMF_OPEN}) => {
      const useGlobalProps = useGlobal()
      const {TbmVehicle} = GMF_OPEN ?? {}

      return (
        <>
          <ChildCreator
            {...{
              ParentData: TbmVehicle,
              models: {parent: `tbmVehicle`, children: `tbmCarWashHistory`},
              myTable: {
                delete: false,
                // update: false,
              },
              additional: {
                include: {User: {}},
                orderBy: [{date: `desc`}],
              },

              columns: ColBuilder.tbmCarWashHistory({
                useGlobalProps,
                ColBuilderExtraProps: {tbmVehicleId: TbmVehicle.id},
              }),

              useGlobalProps,
            }}
          />
        </>
      )
    },
  })
}
