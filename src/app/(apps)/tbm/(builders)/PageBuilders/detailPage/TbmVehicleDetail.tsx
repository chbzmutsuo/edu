'use client'

import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
import {DetailPagePropType} from '@cm/types/types'
import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import BasicTabs from '@components/utils/tabs/BasicTabs'
import EtcConnetor from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/EtcConnector/EtcConnetor'

export default function TbmVehicleDetail(props: DetailPagePropType) {
  const {useGlobalProps} = props

  const childTableWidth = 1300

  return (
    <BasicTabs
      {...{
        id: `tbmVechicleDetailPage`,
        showAll: false,
        style: {width: childTableWidth},
        TabComponentArray: [
          {label: `基本情報`, component: <MyForm {...props}></MyForm>},
          {
            label: `整備履歴`,
            component: (
              <div>
                <ChildCreator
                  {...{
                    ParentData: props.formData ?? {},
                    useGlobalProps,
                    additional: {
                      include: {TbmVehicle: {}},
                      orderBy: [{date: `desc`}],
                    },

                    models: {parent: `tbmVehicle`, children: `tbmVehicleMaintenanceRecord`},
                    columns: ColBuilder.tbmVehicleMaintenanceRecord({
                      useGlobalProps,
                      ColBuilderExtraProps: {tbmVehicleId: props.formData?.id},
                    }),
                  }}
                />
              </div>
            ),
          },
          {
            label: `洗車履歴`,
            component: (
              <div>
                <ChildCreator
                  {...{
                    ParentData: props.formData ?? {},
                    useGlobalProps,
                    additional: {
                      include: {TbmVehicle: {}},
                      orderBy: [{date: `desc`}],
                    },

                    models: {parent: `tbmVehicle`, children: `tbmCarWashHistory`},
                    columns: ColBuilder.tbmCarWashHistory({
                      useGlobalProps,
                      ColBuilderExtraProps: {tbmVehicleId: props.formData?.id},
                    }),
                  }}
                />
              </div>
            ),
          },
          {
            label: `燃料カード`,
            component: (
              <div>
                <ChildCreator
                  {...{
                    ParentData: props.formData ?? {},
                    useGlobalProps,
                    additional: {
                      orderBy: [{date: `desc`}],
                      include: {TbmVehicle: {}},
                    },

                    models: {parent: `tbmVehicle`, children: `tbmFuelCard`},
                    columns: ColBuilder.TbmFuelCard({
                      useGlobalProps,
                      ColBuilderExtraProps: {tbmVehicleId: props.formData?.id},
                    }),
                  }}
                />
              </div>
            ),
          },

          {
            label: `ETC利用明細連携データ`,
            component: (
              <div>
                <EtcConnetor
                  {...{
                    useGlobalProps,
                    tbmVehicleId: props.formData?.id,
                  }}
                />
              </div>
            ),
          },
        ],
      }}
    />
  )
}
