import React from 'react'
import {Grouping} from '@app/(apps)/Grouping/class/Grouping'

import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts'

export default function ChartComponent({Game, player, players}) {
  const latestPrompt = Game?.QuestionPrompt?.[Game?.QuestionPrompt?.length - 1]

  const dataSourcePrompt = latestPrompt

  const dataSource = dataSourcePrompt?.Answer?.map(data => {
    const {curiocity, efficacy} = Grouping.getCuriocityAndEfficacy(data)
    return {...data, curiocity, efficacy}
  })
  const data = dataSource ?? []

  const Graph = () => {
    const chartData = data.map(item => ({
      name: item.Student.name,
      curiocity: item.curiocity,
      efficacy: item.efficacy,
    }))

    return (
      <LineChart
        width={500}
        height={300}
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="curiocity" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="curiocity" stroke="#8884d8" activeDot={{r: 8}} />
        <Line type="monotone" dataKey="efficacy" stroke="#82ca9d" />
      </LineChart>
    )
  }

  return (
    <div>
      <Graph />
    </div>
  )
}
