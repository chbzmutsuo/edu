import useGlobal from '@hooks/globalHooks/useGlobal'
import React from 'react'

import {FormProps} from '@app/(apps)/tbm/(pages)/tbmOperationGroupCreate/FormList/formList'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'

export default function Fuel(props: FormProps) {
  const {userInput, type, labelAffix} = props
  const data = userInput[type ?? '']

  const useGlobalProps = useGlobal()
  const {session} = useGlobalProps

  const TbmVehicle = userInput.base?.[`TbmVehicle`]

  return (
    <div>
      <ChildCreator
        {...{
          ParentData: TbmVehicle,
          models: {parent: `tbmVehicle`, children: `tbmRefuelHistory`},
          additional: {
            payload: {
              tbmVehicleId: TbmVehicle.id,
              tbmOperationGroupId: userInput.base?.id,
            },
            include: {TbmVehicle: {}},
          },
          columns: ColBuilder.tbmRefuelHistory({
            useGlobalProps,
            ColBuilderExtraProps: {tbmVehicleId: TbmVehicle.id},
          }),

          useGlobalProps,
        }}
      />
    </div>
  )
}
