import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import {NumHandler} from '@class/NumHandler'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import {TextOrange} from '@components/styles/common-components/Alert'
import {useGlobalModalForm} from '@components/utils/modal/useGlobalModalForm'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {atomKey} from '@hooks/useJotai'
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
