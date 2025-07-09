'use client'

import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
import {DetailPagePropType} from '@cm/types/types'

import CalendarSetter from '@app/(apps)/tbm/(pages)/DriveSchedule/CalendarSetter'
import {Days} from '@class/Days/Days'
import {toUtc} from '@class/Days/date-utils/calculations'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {createUpdate} from '@lib/methods/createUpdate'
toastByResult
import {doTransaction} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {toastByResult} from '@lib/ui/notifications'
import BasicTabs from '@components/utils/tabs/BasicTabs'
import {Head1} from '@components/styles/common-components/heading'
import {ColBuilder} from '@app/(apps)/tbm/(builders)/ColBuilders/ColBuilder'
import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'

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
            <div>
              <Head1>{props.formData?.name}</Head1>
            </div>
            <CalendarSetter
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
    <BasicTabs
      {...{
        id: `tbmVechicleDetailPage`,
        showAll: false,
        TabComponentArray,
      }}
    />
  )
}
