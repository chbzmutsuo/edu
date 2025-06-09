'use client'
import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import TbmRouteGroupDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmRouteGroupDetail'
import {TbmRouteGroupUpsertController} from '@app/(apps)/tbm/(builders)/PageBuilders/TbmRouteGroupUpsertController'
import {Days} from '@class/Days/Days'
import {getMidnight, toUtc} from '@class/Days/date-utils/calculations'

import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import {R_Stack} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'
import React from 'react'

export default function RouteDisplay({tbmBase, whereQuery}) {
  const useGlobalProps = useGlobal()
  const {query} = useGlobalProps
  const {firstDayOfMonth: yearMonth} = Days.month.getMonthDatum(query.from ? toUtc(query.from) : getMidnight())

  return (
    <R_Stack className={` items-start`}>
      <ChildCreator
        {...{
          ParentData: tbmBase,
          models: {parent: `tbmBase`, children: `tbmRouteGroup`},
          additional: {
            where: {
              tbmBaseId: tbmBase?.id,
            },
            include: {
              TbmBase: {},
              TbmDriveSchedule: {
                where: {
                  // finished: true,
                  date: whereQuery,
                },
              },
              Mid_TbmRouteGroup_TbmCustomer: {include: {TbmCustomer: true}},
              Mid_TbmRouteGroup_TbmProduct: {include: {TbmProduct: true}},
              TbmMonthlyConfigForRouteGroup: {where: {yearMonth: whereQuery}},
              TbmRouteGroupFee: {orderBy: {startDate: `desc`}, take: 1},
            },
            orderBy: [{code: `asc`}],
          },
          myForm: {create: TbmRouteGroupUpsertController},
          myTable: {style: {width: `90vw`}, pagination: {countPerPage: 10}},
          columns: ColBuilder.tbmRouteGroup({
            useGlobalProps,
            ColBuilderExtraProps: {showMonthConfig: true, yearMonth},
          }),

          useGlobalProps,

          EditForm: TbmRouteGroupDetail,
        }}
      />
    </R_Stack>
  )
}
