'use client'
import {getVehicleForSelectConfig} from '@app/(apps)/tbm/(builders)/ColBuilders/TbmVehicleColBuilder'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'

export const TbmDriveScheduleBuilder = (props: columnGetterType) => {
  const tbmDriveSchedule = props.ColBuilderExtraProps?.tbmDriveSchedule
  const tbmBase = props.ColBuilderExtraProps?.tbmBase
  const {date, userId, TbmVehicle, tbmRouteGroupId} = tbmDriveSchedule ?? {}

  return new Fields([
    {
      id: 'date',
      label: '日付',
      form: {
        ...defaultRegister,
        defaultValue: date,
        disabled: date,
      },
      type: 'date',
    },
    {
      id: 'tbmBaseId',
      label: '営業所',
      form: {
        ...defaultRegister,
        defaultValue: tbmBase?.id,
        disabled: tbmBase?.id,
      },
      forSelect: {},
    },
    {
      id: 'userId',
      label: 'ドライバ',
      form: {
        ...defaultRegister,
        defaultValue: userId,
        // disabled: userId,
      },
      forSelect: {},
    },

    {
      id: 'tbmVehicleId',
      label: '車両',
      form: {
        ...defaultRegister,
        defaultValue: TbmVehicle?.id,
      },
      forSelect: {
        config: getVehicleForSelectConfig({tbmBaseId: tbmBase?.id}),
      },
    },
    {
      id: 'tbmRouteGroupId',
      label: 'ルート',
      forSelect: {
        config: {
          where: {tbmBaseId: tbmBase?.id},
          orderBy: [{id: 'asc'}],
          nameChanger(op) {
            return {...op, name: op ? [`[${op.id}]`, op.name].join(` `) : ''}
          },
        },
      },
      form: {
        ...defaultRegister,
        defaultValue: tbmRouteGroupId,

        // disabled: tbmRouteGroupId,
      },
    },
  ])
    .customAttributes(({col}) => {
      return {...col, form: {...col.form, style: {minWidth: 240}}, search: {}}
    })
    .transposeColumns()
}
