'use client'

import TbmRouteCl, {TbmRouteData} from '@app/(apps)/tbm/(class)/TbmRouteCl'
import useUnchinChildCreator from '@app/(apps)/tbm/(globalHooks)/useUnchinChildCreator'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {NumHandler} from '@class/NumHandler'
import {Fields} from '@cm/class/Fields/Fields'
import {columnGetterType} from '@cm/types/types'
import {R_Stack} from '@components/styles/common-components/common-components'
import {SquarePen} from 'lucide-react'

export const tbmMonthlyConfigForRouteGroupBuilder = (props: columnGetterType) => {
  const HK_UnchinChildCreator = useUnchinChildCreator()

  return new Fields([
    {
      id: `fee-history`,
      label: '付帯作業 / 運賃 \n(最新を表示)',
      form: {hidden: true},
      format: (value, row) => {
        const latestTbmRouteGroupFee = row.TbmRouteGroupFee[0]
        const {futaiFee = 0, driverFee = 0} = latestTbmRouteGroupFee ?? {}

        return (
          <R_Stack className={`gap-0 flex-nowrap w-[160px]`}>
            <SquarePen
              {...{className: `mr-4 h-5 t-link onHover`, onClick: () => HK_UnchinChildCreator.setGMF_OPEN({TbmRouteGroup: row})}}
            />
            <div className={` min-w-[60px]`}>{NumHandler.WithUnit(futaiFee ?? 0, '')}</div>
            <div>{NumHandler.WithUnit(driverFee ?? 0, '')}</div>
          </R_Stack>
        )
      },
    },

    {
      id: 'seikyuKaisu',
      label: '請求回数\n(チェック用)',
      type: 'number',
      td: {style: {width: 100}},
    },

    {
      id: 'postalFee',
      label: `実働回数 / 通行料(郵便)`,
      type: 'number',

      form: {hidden: true},
      format: (value, row: TbmRouteData) => {
        const {TbmDriveSchedule, TbmMonthlyConfigForRouteGroup} = row
        const monthConfig = TbmMonthlyConfigForRouteGroup?.[0]
        const TbmRouteInst = new TbmRouteCl(row)
        const {tsukoryo, jitsudoKaisu} = TbmRouteInst.getMonthlyData(monthConfig?.yearMonth)

        return (
          <div style={{width: 160}}>
            <R_Stack className={`gap-2   flex-nowrap`}>
              <div className={` min-w-[60px]`}>{jitsudoKaisu}回</div>
              <div {...{label: '通行料(一般)'}}>{NumHandler.WithUnit(tsukoryo, '')}</div>
            </R_Stack>
          </div>
        )
      },
    },

    {
      id: 'generalFee',
      label: '通行料\n(一般)',
      type: 'number',
      td: {style: {width: 80}},
    },

    {
      id: 'tsukoryoSeikyuGaku',
      label: '通行料請求額',
      type: 'number',
      td: {style: {width: 80}},
    },
  ])
    .customAttributes(({col}) => ({...col, form: {...defaultRegister}}))
    .transposeColumns()
}
