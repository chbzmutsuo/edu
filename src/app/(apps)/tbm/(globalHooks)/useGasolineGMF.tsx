import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import {NumHandler} from '@cm/class/NumHandler'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import {TextOrange} from '@cm/components/styles/common-components/Alert'
import {useGlobalModalForm} from '@cm/components/utils/modal/useGlobalModalForm'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {atomKey} from '@cm/hooks/useJotai'
import React from 'react'

export default function useGasolineGMF() {
  type gasolineGMF = {
    TbmVehicle: any
    lastOdometerEnd: number
  }

  const atomKey = `odometerInputGMF`
  return useGlobalModalForm<gasolineGMF>(`gasolineGMF` as atomKey, null, {
    mainJsx: ({GMF_OPEN, setGMF_OPEN}) => {
      const useGlobalProps = useGlobal()
      const {TbmVehicle, lastOdometerEnd} = GMF_OPEN ?? {}

      return (
        <>
          {!!lastOdometerEnd && (
            <div>
              <span>最終時のオドメーター</span>
              <TextOrange>{NumHandler.toPrice(lastOdometerEnd) + ' km'}</TextOrange>
            </div>
          )}
          <ChildCreator
            {...{
              ParentData: TbmVehicle,
              models: {parent: `tbmVehicle`, children: `tbmRefuelHistory`},
              myTable: {
                // update: false,
              },
              additional: {
                include: {User: {}},
                orderBy: [{date: `desc`}],
              },

              columns: ColBuilder.tbmRefuelHistory({
                useGlobalProps,
                ColBuilderExtraProps: {tbmVehicleId: TbmVehicle.id, lastOdometerEnd},
              }),

              useGlobalProps,
            }}
          />
        </>
      )
    },
  })
}
