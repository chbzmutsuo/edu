'use client'

import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import {DetailPagePropType} from '@cm/types/types'
import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import EtcConnetor from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/EtcConnector/EtcConnetor'

export default function TbmVehicleDetail(props: DetailPagePropType) {
  const {useGlobalProps} = props

  const childTableWidth = 1300

  let TabComponentArray = [{label: `基本情報`, component: <MyForm {...props}></MyForm>}]

  if (props.formData?.id) {
    TabComponentArray = [
      ...TabComponentArray,
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
        label: `燃料カード`,
        component: (
          <div>
            <ChildCreator
              {...{
                ParentData: props.formData ?? {},
                useGlobalProps,
                additional: {
                  orderBy: [{endDate: `desc`}],
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
        label: `給油履歴`,
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

                models: {parent: `tbmVehicle`, children: `tbmRefuelHistory`},
                columns: ColBuilder.tbmRefuelHistory({
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
    ]
  }

  return (
    <BasicTabs
      {...{
        id: `tbmVechicleDetailPage`,
        showAll: false,
        style: {width: childTableWidth, height: `80vh`},
        TabComponentArray,
      }}
    />
  )
}
