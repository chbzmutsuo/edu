'use client'

import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import {DetailPagePropType} from '@cm/types/types'

import {Days} from '@cm/class/Days/Days'
import {toUtc} from '@cm/class/Days/date-utils/calculations'
import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {createUpdate} from '@cm/lib/methods/createUpdate'
toastByResult
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {toastByResult} from '@cm/lib/ui/notifications'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import BulkCalendarSetter from '@app/(apps)/tbm/(pages)/eigyoshoSettei/components/BulkCalendarSetter'

export default function TbmRouteGroupDetail(props: DetailPagePropType) {
  const {useGlobalProps} = props
  const {query} = useGlobalProps

  const {data: calendar = []} = useDoStandardPrisma(`tbmRouteGroupCalendar`, `findMany`, {
    where: {tbmRouteGroupId: props.formData?.id},
    orderBy: {date: 'asc'},
  })

  const theMonth = toUtc(query.from || query.month)
  const theYear = theMonth.getFullYear()

  const {firstDateOfYear, lastDateOfYear, getAllMonthsInYear} = Days.year.getYearDatum(theYear)
  const months = getAllMonthsInYear()

  const days = Days.day.getDaysBetweenDates(firstDateOfYear, lastDateOfYear)
  // .filter(d => d.getTime() >= theMonth.getTime())

  const defaultSelectedDays = calendar.filter(c => c.holidayType === '稼働').map(c => c.date)
  const tbmRouteGroupId = props.formData?.id

  let TabComponentArray = [{label: `基本情報`, component: <MyForm {...props}></MyForm>}]

  if (props.formData?.id) {
    TabComponentArray = [
      ...TabComponentArray,
      {
        label: `付帯作業/運賃`,
        component: (
          <ChildCreator
            {...{
              ParentData: props.formData,
              models: {parent: `tbmRouteGroup`, children: `tbmRouteGroupFee`},
              additional: {
                orderBy: [{startDate: `desc`}],
              },

              columns: ColBuilder.tbmRouteGroupFee({useGlobalProps}),
              useGlobalProps,
            }}
          />
        ),
      },
      {
        label: `配車予定`,
        component: (
          <div>
            <BulkCalendarSetter
              {...{
                months,
                days: days,
                defaultSelectedDays: defaultSelectedDays,
                onConfirm: async ({selectedDays}) => {
                  if (!confirm('変更を反映しますか？')) return

                  const res = await doTransaction({
                    transactionQueryList: days.map(day => {
                      const isSelected = selectedDays.some(d => Days.validate.isSameDate(d, day))

                      const unique_tbmRouteGroupId_date = {
                        tbmRouteGroupId,
                        date: day,
                      }

                      return {
                        model: 'tbmRouteGroupCalendar',
                        method: 'upsert',
                        queryObject: {
                          where: {unique_tbmRouteGroupId_date},
                          ...createUpdate({...unique_tbmRouteGroupId_date, holidayType: isSelected ? '稼働' : ''}),
                        },
                      }
                    }),
                  })
                  toastByResult(res)
                },
              }}
            />
          </div>
        ),
      },
    ]
  }

  return (
    <div>
      <div>{props.formData?.name}</div>
      <BasicTabs
        {...{
          id: `tbmVechicleDetailPage`,
          showAll: false,
          TabComponentArray,
        }}
      />
    </div>
  )
}
