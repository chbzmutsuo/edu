'use client'
import {Grouping} from '@app/(apps)/Grouping/class/Grouping'

import C_E_PositionMap from '@app/(apps)/Grouping/components/Grouping/game/Chart/PositionMap/PositionMap'
import Time_Score_Chart from '@app/(apps)/Grouping/components/Grouping/game/Chart/Time_Score_Chart'
import {GameContextType} from '@app/(apps)/Grouping/components/Grouping/game/GameMainPage'

import {Fields} from '@cm/class/Fields/Fields'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Button} from '@components/styles/common-components/Button'
import {R_Stack} from '@components/styles/common-components/common-components'

import React, {useState} from 'react'

const TeacherDispChartWrapper = React.memo((props: {GameCtxValue: GameContextType; centerWidth}) => {
  const {centerWidth} = props

  const [activeGroupIdx, setactiveGroupIdx] = useState(null)
  const {Game, players, activeGroup, chartPageSelecedData, setchartPageSelecedData} = props.GameCtxValue
  const chartHeight = 400

  const SquadArr = activeGroup?.Squad ?? []

  const squadIndexArr = SquadArr?.map((s, idx) => idx + 1)
  const columns = Fields.transposeColumns([
    {id: 'playerId', label: '児童・生徒', forSelect: {optionsOrOptionFetcher: players}},
    {id: 'groupIdx', label: 'グループ', forSelect: {optionsOrOptionFetcher: squadIndexArr}},
    {
      id: 'nthPrompt',
      label: 'N回目アンケート',
      forSelect: {
        optionsOrOptionFetcher: Game.QuestionPrompt.map((data, i) => i + 1).filter(i => i > 1),
      },
    },
  ])

  const {formRef, BasicForm, latestFormData} = useBasicFormProps({
    columns,
    formData: {...chartPageSelecedData},
    onFormItemBlur: data => {
      const {name, value} = data
      setchartPageSelecedData(prev => {
        return {...prev, [name]: value}
      })
    },
  })

  const {playerId, nthPrompt, groupIdx} = chartPageSelecedData ?? {}

  /**グラフの対象となるプレイヤー*/
  const selectedPlayers = (() => {
    let selectedPlayers = [...players]
    selectedPlayers = players.filter(p => {
      const studentGroupIdx = SquadArr.findIndex(s => {
        return s.Student.find(s => s.id === p.id)
      })

      const filterByStudentId = !playerId ? true : p.id === Number(playerId)
      const filterByGroupIdx = !groupIdx ? true : Number(groupIdx) - 1 === studentGroupIdx
      return filterByStudentId && filterByGroupIdx
    })
    selectedPlayers = selectedPlayers.map(p => {
      const studentGroupIdx = SquadArr.findIndex(s => {
        return s.Student.find(s => s.id === p.id)
      })
      return {...p, groupIdx: studentGroupIdx}
    })

    return selectedPlayers
  })()

  const data1 = Grouping.chart.prepare_positionMappingData({
    Game,
    players,
    nthPrompt: 1,
    selectedPlayers,
  })
  const data2 = Grouping.chart.prepare_positionMappingData({
    Game,
    players,
    nthPrompt: nthPrompt,
    selectedPlayers,
  })

  const data3 = Game.Answer.filter(a => {
    const con1_ByPlayer = selectedPlayers.map(p => p.id).includes(a.studentId)
    const con2_RnadomSampleOnly = a.questionPromptId === null
    const con3_answerd = a.curiocity1 !== null
    return con1_ByPlayer && con2_RnadomSampleOnly && con3_answerd
  })
  const marginX = 70
  const mapChartWidth = (centerWidth - marginX) / 2
  const timeChartWidth = centerWidth - marginX

  return (
    <div className={`col-stack gap-2`}>
      {/* 選択 */}
      <section className={`p-2`}>
        <R_Stack>
          <BasicForm
            latestFormData={latestFormData}
            alignMode="row"
            ControlOptions={{
              ControlStyle: {width: 150},
            }}
          ></BasicForm>
          <Button
            color="red"
            type="button"
            onClick={e => {
              setchartPageSelecedData({
                playerId: undefined,
                groupIdx: undefined,
              })
            }}
          >
            絞込解除
          </Button>
        </R_Stack>
      </section>

      <section>
        <div className={`row-stack   justify-center `}>
          <div>
            <h2>
              <span className={`text-lg font-bold text-red-500`}>初回</span>アンケート
            </h2>
            <div>
              <C_E_PositionMap
                {...{
                  setchartPageSelecedData,
                  activeGroupIdx,
                  setactiveGroupIdx,
                  height: mapChartWidth,
                  width: mapChartWidth,
                  data: data1,
                }}
              />
            </div>
          </div>
          {Game.QuestionPrompt.length === 1 ? (
            <></>
          ) : (
            <div>
              <h2>
                <span className={`text-lg font-bold text-red-500`}>{nthPrompt}</span>
                回目アンケート
              </h2>
              <C_E_PositionMap
                {...{
                  setchartPageSelecedData,
                  activeGroupIdx,
                  setactiveGroupIdx,
                  height: mapChartWidth,
                  width: mapChartWidth,
                  data: data2,
                }}
              />
            </div>
          )}
        </div>
      </section>
      <section>
        <Time_Score_Chart
          {...{
            height: chartHeight,
            width: timeChartWidth,
            data: Grouping.chart.prepare_time_curiocity_efficacy_data(data3),
          }}
        />
      </section>
    </div>
  )
})
export default TeacherDispChartWrapper
