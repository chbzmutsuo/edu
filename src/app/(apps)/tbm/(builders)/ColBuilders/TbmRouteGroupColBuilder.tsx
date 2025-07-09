'use client'
import {tbmMonthlyConfigForRouteGroupBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/tbmMonthlyConfigForRouteGroupBuilder'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'

import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Fields} from '@cm/class/Fields/Fields'
import {colType, columnGetterType} from '@cm/types/types'
import {createUpdate} from '@lib/methods/createUpdate'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {useState} from 'react'
import {toast} from 'react-toastify'

export const TbmRouteGroupColBuilder = (props: columnGetterType) => {
  const {yearMonth, showMonthConfig = false, tbmBaseId} = props.ColBuilderExtraProps ?? {}

  const {useGlobalProps} = props

  const regularStyle = {minWidth: 100, color: `#43639a`, fontSize: 12}

  let colsource: colType[] = [
    ...new Fields([
      // {
      //   id: 'code',
      //   label: 'CD',
      //   form: {...defaultRegister, defaultValue: null},
      //   td: {style: {...regularStyle, minWidth: 60}},
      // },
      {
        id: 'tbmBaseId',
        label: '営業所',
        forSelect: {},
        form: {
          ...defaultRegister,
          defaultValue: tbmBaseId,
          disabled: tbmBaseId,
        },
        td: {style: {...regularStyle}},
      },
      {
        id: 'seikyuKbn',
        label: '区分',
        td: {style: {...regularStyle, minWidth: 180, fontSize: 12}},
        form: {...defaultRegister, defaultValue: `01`},
        forSelect: {codeMaster: TBM_CODE.ROUTE.KBN},
      },
      {
        id: 'name',
        label: '便名',
        td: {style: {...regularStyle, minWidth: 200}},
        form: {...defaultRegister},
        search: {},
      },
      {
        id: 'routeName',
        label: '路線名',
        td: {style: {...regularStyle, minWidth: 200}},
        form: {},
        search: {},
      },
    ]).buildFormGroup({groupName: '便設定①'}).plain,
    ...new Fields([
      {
        id: 'vehicleType',
        label: '車種',
        type: 'text',
        td: {style: {...regularStyle, width: 80}},
        form: {},
      },
      {
        id: 'delegatePattern',
        label: '委託パターン',
        td: {style: {...regularStyle, minWidth: 200}},
        form: {hidden: true},
      },
      {
        id: `productName`,
        label: `品名`,
        td: {style: {...regularStyle, minWidth: 150}},
        form: {},
      },

      {
        id: `tbmCustomerId`,
        label: `取引先`,
        td: {style: {...regularStyle, minWidth: 200}},
        form: {
          defaultValue: (alreadyRegisteredFormData, formData, col) => {
            return formData?.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.id
          },
        },
        forSelect: {},

        format: (val, routeGroup) => {
          return <div>{routeGroup.Mid_TbmRouteGroup_TbmCustomer?.TbmCustomer?.name}</div>
        },
      },
    ]).buildFormGroup({groupName: '便設定②'}).plain,
  ]

  if (showMonthConfig) {
    colsource = [
      ...colsource,

      ...tbmMonthlyConfigForRouteGroupBuilder({useGlobalProps})
        .flat()
        .map(col => {
          const dataKey = col.id
          return {
            id: dataKey,
            label: col.label,
            format: (val, row) => {
              if (col.format) {
                return col.format(val, row, col)
              }

              const MonthConfig = row?.TbmMonthlyConfigForRouteGroup?.[0]
              const defaultValue = MonthConfig?.[dataKey] ?? ''
              const [value, setvalue] = useState(defaultValue)
              const unique_yearMonth_tbmRouteGroupId = {yearMonth, tbmRouteGroupId: row.id}
              const style = col.td?.style

              return (
                <input
                  style={style}
                  type={col.type}
                  className={`control-border  pl-1 ${value ? '' : ' opacity-30'}`}
                  onChange={e => setvalue(e.target.value)}
                  onBlur={async e => {
                    const value = col.type === `number` ? Number(e.target.value) : e.target.value

                    const res = await doStandardPrisma(`tbmMonthlyConfigForRouteGroup`, `upsert`, {
                      where: {unique_yearMonth_tbmRouteGroupId},
                      ...createUpdate({
                        ...unique_yearMonth_tbmRouteGroupId,
                        [dataKey]: value ?? '',
                      }),
                    })
                    if (res.success === false) {
                      toast.error(res.message)
                    }
                  }}
                  value={value ?? null}
                />
              )
            },
          }
        }),
    ]
  }

  return new Fields([...colsource]).transposeColumns()
}
