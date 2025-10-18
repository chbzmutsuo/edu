import useRecharts from '@cm/hooks/useRecharts'

import React from 'react'
import {XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, Area, ComposedChart, Bar} from 'recharts'

const Time_Score_Chart = ({data, width, height}) => {
  const {
    style: {chartDefaultStyle},
    axis: {generateTicks},
  } = useRecharts()

  function trendLine(data, key) {
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumXX = 0
    let count = 0

    for (let i = 0; i < data.length; i++) {
      const x = i

      const y = data[i][key] // 例として好奇心のデータを使用

      sumX += x
      sumY += y
      sumXY += x * y
      sumXX += x * x
      count++
    }

    const slope = (count * sumXY - sumX * sumY) / (count * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / count

    const result: any[] = []

    for (let i = 0; i < data.length; i++) {
      const x = i
      result.push({time: data[i].time, [key + '傾向']: slope * x + intercept})
    }

    return result
  }

  data.length === 1 ? (data = [data[0], ...data]) : ''
  return (
    <div>
      <ComposedChart
        {...{
          ...chartDefaultStyle,
          width,
          height,
          padding: {left: 40},
          data,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="category" dataKey={'time'}>
          <Label value="時間" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis type="number" ticks={generateTicks(1, 25)}>
          <Label value="スコア" angle={-90} position="insideLeft" offset={10} />
        </YAxis>

        <Tooltip />

        <Bar
          {...{
            name: '件数',
            dataKey: 'count',
            stroke: '#ff4141',
            barSize: 10,
            type: 'monotone',
            fill: 'rgb(216, 132, 132)',
          }}
        />
        <Area
          {...{
            name: '好奇心',
            dataKey: 'curiocity',
            stroke: '#8884d8',
            strokeWidth: 3,
            type: 'monotone',
            fill: 'rgba(136, 132, 216, 0.2)',
          }}
        />
        <Area
          {...{
            name: '効力感',
            dataKey: 'efficacy',
            stroke: '#82ca9d',
            strokeWidth: 3,
            type: 'monotone',
            fill: 'rgba(130, 202, 157, 0.2)',
          }}
        />
        {/* <Line
          type="natural"
          dataKey="好奇心傾向"
          data={trendLine(data, '好奇心')}
          stroke="#8884d8"
          dot={false}
        />
        <Line
          type="natural"
          dataKey="効力感傾向"
          data={trendLine(data, '効力感')}
          stroke="#82ca9d"
          dot={false}
        /> */}

        <Legend verticalAlign="top" align="right" />
      </ComposedChart>
    </div>
  )
}
export default Time_Score_Chart
