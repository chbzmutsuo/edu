'use client'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType, forSelectConfig} from '@cm/types/types'

export const TbmVehicleColBuilder = (props: columnGetterType) => {
  return new Fields([
    ...new Fields([
      ...new Fields([
        {id: 'tbmBaseId', label: '営業所', forSelect: {}, form: {}},
        {id: 'type', label: '車種', form: {}},
      ]).aggregateOnSingleTd().plain,
      ...new Fields([
        {id: 'frameNo', label: 'フレーム番号', form: {}},
        {id: 'vehicleNumber', label: '車両番号', form: {...defaultRegister}},
      ]).aggregateOnSingleTd().plain,

      ...new Fields([
        //

        {id: 'shape', label: '形状', form: {}},
        {id: 'airSuspension', label: 'エアサス有無', form: {}},
      ]).aggregateOnSingleTd().plain,
    ]).buildFormGroup({groupName: '車両情報①'}).plain,

    ...new Fields([
      {id: 'oilTireParts', label: '油脂/タイヤ/備品代', form: {}},
      {id: 'maintenance', label: '整備代', form: {}},
      {id: 'insurance', label: '保険代', form: {}},
    ])
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: '車両情報②'}).plain,

    ...new Fields([
      {id: 'jibaisekiHokenCompany', label: '自賠責\n(会社)', form: {}},
      {id: 'jibaisekiManryobi', label: '自賠責保険\n(満了日)', form: {}, type: 'date'},

      //
    ])
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: '保険情報①'}).plain,

    ...new Fields([
      //
      {id: 'jidoshaManryobi', label: '自動車保険\n(満了日)', form: {}, type: 'date'},
      {id: 'jidoshaHokenCompany', label: '自動車保険\n(会社)', form: {}},
    ])
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: '保険情報②'}).plain,

    ...new Fields([
      //
      {id: 'kamotsuHokenCompany', label: '貨物保険\n(会社)', form: {}},
      {id: 'kamotsuManryobi', label: '貨物保険\n(満了日)', form: {}, type: 'date'},
    ])
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: '保険情報③'}).plain,

    ...new Fields([
      //
      {id: 'sharyoHokenCompany', label: '車両保険\n(会社)', form: {}},
      {id: 'sharyoManryobi', label: '車両保険\n(満了日)', form: {}, type: 'date'},
    ])
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: '保険情報④'}).plain,

    ...new Fields([
      //
      {id: 'etcCardNumber', label: 'ETCカード番号', form: {}},
      {id: 'etcCardExpiration', label: 'ETCカード満', form: {}, type: 'date'},
    ])
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: 'ETCカード情報'}).plain,
    // ETCカード情報

    // ...new Fields([
    //   // 保険情報

    // ]).buildFormGroup({groupName: '保険情報'}).plain,

    ...new Fields([
      //
      {
        id: 'shodoTorokubi',
        label: '初度登録日',
        form: {},
        type: `date`,
      },

      {
        id: 'sakenManryobi',
        label: '車検満了日',
        form: {hidden: true},

        format: (value, row) => {
          const {TbmVehicleMaintenanceRecord} = row
          const lastInspection = TbmVehicleMaintenanceRecord.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          }).find(item => item.type === '車検')

          if (lastInspection) {
            const nextInspection = Days.year.add(lastInspection.date, 2)
            return <div style={{minWidth: 140}}>{formatDate(nextInspection, 'short')}</div>
          }

          return `過去の点検なし`
        },
      },
      {
        id: 'sankagetsuTenkenbi',
        label: '3ヶ月点検',
        form: {hidden: true},
        format: (value, row) => {
          const {TbmVehicleMaintenanceRecord} = row

          const lastInspection = TbmVehicleMaintenanceRecord.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime()
          }).find(item => item.type === '3ヶ月点検')

          if (lastInspection) {
            const nextInspection = Days.month.add(lastInspection.date, 3)
            return <div style={{minWidth: 140}}>{formatDate(nextInspection, 'short')}</div>
          }

          return `過去の点検なし`
        },
      },
    ])
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: '車両情報③'}).plain,

    ...new Fields([
      //

      {
        id: 'sokoKyori',
        label: '走行距離',
        form: {hidden: true},
        format: (value, row) => {
          return `自動計算`
        },
      },

      {
        id: 'maintenanceRecord',
        label: '整備記録',
        form: {hidden: true},
        format: (value, row) => {
          const {TbmVehicleMaintenanceRecord} = row
          return `${TbmVehicleMaintenanceRecord.length}件`
        },
      },
    ])
      .aggregateOnSingleTd()
      .buildFormGroup({groupName: '車両情報③'}).plain,
  ]).transposeColumns()
}

export const getVehicleForSelectConfig = ({tbmBaseId}: {tbmBaseId?: number}) => {
  const result: forSelectConfig = {
    where: {tbmBaseId: tbmBaseId ?? undefined},
    orderBy: [{id: `asc`}],
    select: {
      id: `number`,
      code: `string`,
      frameNo: `string`,
      vehicleNumber: `string`,
      type: `string`,
      shape: `string`,
      name: false,
    },
    nameChanger(op) {
      const {type, shape, frameNo} = op
      return {...op, name: op ? [`[${type}]`, frameNo, op.vehicleNumber, shape].join(` `) : ''}
    },
  }

  return result
}
