import {Grouping, RoomClass} from '@app/(apps)/edu/class/Grouping'
import {Fields} from '@cm/class/Fields/Fields'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import useWindowSize from '@cm/hooks/useWindowSize'
import React, {useState} from 'react'

import {Days} from '@cm/class/Days/Days'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'

import Time_Score_Chart from '@app/(apps)/edu/Grouping/components/Grouping/game/Chart/Time_Score_Chart'
import {Button} from '@cm/components/styles/common-components/Button'

const RoomChartList = React.memo((props: any) => {
  return <></>
  const {room} = props
  const players: any[] = RoomClass.getPlayes({room}) ?? []
  const {width} = useWindowSize()

  const today = getMidnight(new Date())
  const tomorrow = Days.day.add(today, 1)

  const formData = {
    dateFrom: today,
    dateTo: tomorrow,
  }

  const getChartData = (props: any) => {
    const {playerName, dateFrom, dateTo, subjectNameMasterId} = props
    const selectedPlayer: any = playerName ? players.find(p => p.name === playerName) : players
    const studentId = selectedPlayer?.id

    const data = RoomClass.getAnswers({
      room,
      subjectNameMasterId,
      studentId,
      dateFrom,
      dateTo,
    })

    return data
  }
  const [data, setdata] = useState<any>(getChartData(formData))

  const {BasicForm, latestFormData} = useBasicFormProps({
    formData,
    columns: Fields.transposeColumns([
      ...Fields.mod.setAttribute({
        cols: [
          {
            id: 'playerName',
            label: '児童・生徒',
            forSelect: {
              optionsOrOptionFetcher: players.map(p => p.name),
            },
          },
          {
            id: 'subjectNameMasterId',
            label: '教科',
            forSelect: {},
          },
          {
            id: 'dateFrom',
            label: 'いつから',
            type: 'date',
          },
          {
            id: 'dateTo',
            label: 'いつまで',
            type: 'date',
          },
        ],
        attributeSetter: ({col}) => {
          return {...col, form: {}}
        },
      }),
    ]),
  })

  return (
    <div className={`col-stack gap-2`}>
      {/* 選択 */}
      <section className={`p-2`}>
        <BasicForm
          latestFormData={latestFormData}
          onSubmit={latestFormData => {
            const {dateFrom, dateTo} = latestFormData
            const hourDiff = Days.hour.difference(new Date(dateTo), new Date(dateFrom))
            if (hourDiff > 24) {
              if (!confirm(`指定期間が1日を超える場合、計算に時間がかかる場合があります。`)) return
            }

            const data = getChartData({...latestFormData})

            setdata(data)
          }}
          wrapperClass={'row-stack gap-4 flex-wrap'}
          ControlOptions={{
            direction: 'horizontal',
          }}
        >
          <Button color="red">検索</Button>
        </BasicForm>
      </section>

      <section className={`row-stack justify-around`}>
        <div className={`t-paper `}>
          <Time_Score_Chart
            {...{
              height: 400,
              width: width * 0.8,
              data: Grouping.chart.prepare_time_curiocity_efficacy_data(data),
            }}
          />
          {/* <C_E_PositionMap {...{height: chartHeight, width: chart1Width, data: data1}} /> */}
        </div>
        <div className={`t-paper `}></div>
      </section>
    </div>
  )

  return <div></div>
})

export default RoomChartList
