import {ClassRoom} from '@app/(apps)/edu/class/Grouping'

import useRecharts from '@cm/hooks/useRecharts'
import {ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine, Label, Legend} from 'recharts'

import {cl, shorten} from '@cm/lib/methods/common'

import {useLongPress} from '@cm/hooks/useLongPress'
import {KeyValuePair, NoData} from '@components/styles/common-components/common-components'
import {getColorStyles} from '@lib/methods/colors'

const C_E_PositionMap = ({height, width, data, activeGroupIdx, setactiveGroupIdx, setchartPageSelecedData}) => {
  if (!data || !data[0]) return <NoData style={{width, height}}>データが見つかりません</NoData>

  const {
    axis: {generateTicks},
    style: {chartDefaultStyle, getShapeProps},
  } = useRecharts()

  const axisCommonProps = {
    ticks: generateTicks(1, 25),
    domain: [0, 25],
    interval: 2,
  }

  return (
    <>
      <ScatterChart {...{...chartDefaultStyle, width, height}}>
        <CartesianGrid />
        <XAxis
          {...{
            y: 20,
            dataKey: 'x',
            type: 'number',
            name: '効力感',
            ...axisCommonProps,
          }}
        >
          <Label value="効力感" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis
          {...{
            dataKey: 'y',
            type: 'number',
            name: '好奇心',

            ...axisCommonProps,
          }}
        >
          <Label value="好奇心" angle={-90} offset={10} position="insideLeft" />
        </YAxis>

        <ReferenceLine
          label="効力感過多"
          stroke="blue"
          strokeDasharray="3 3"
          segment={[
            {x: 9, y: 0},
            {x: 25, y: 17},
          ]}
        />
        <ReferenceLine
          label="好奇心過多"
          stroke="red"
          strokeDasharray="3 3"
          segment={[
            {x: 0, y: 9},
            {x: 15, y: 25},
          ]}
        />

        <Tooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />

        {renderScatter({data, setchartPageSelecedData, getShapeProps, activeGroupIdx, setactiveGroupIdx})}

        <Legend
          verticalAlign="top"
          align="right"
          payload={[
            {value: '児童・生徒名', color: 'gray', type: 'circle'},
            {value: '好奇心', color: 'red', type: 'line'},
            {value: '効力感', color: 'blue', type: 'line'},
          ]}
        />
      </ScatterChart>
    </>
  )
}
export default C_E_PositionMap

const CustomTooltip = props => {
  const {active, payload, label} = props
  if (active && payload && payload.length) {
    const {Student} = payload[0].payload

    const className = new ClassRoom(Student.Classroom).className

    return (
      <div className="t-paper">
        <KeyValuePair label={'児童・生徒名'}>
          {Student?.name} ({className})
        </KeyValuePair>

        {payload.map((item, i) => {
          const {name, value} = item
          return (
            <KeyValuePair key={i} label={name}>
              {value}
            </KeyValuePair>
          )
        })}
      </div>
    )
  }

  return null
}

const renderScatter = ({data, setchartPageSelecedData, getShapeProps, activeGroupIdx, setactiveGroupIdx}) => {
  const {event, until, isBeingPressed, handleLongPress} = useLongPress({
    onClick: e => {
      setchartPageSelecedData(prev => ({...prev, playerId: e?.Student?.id}))
    },
    onLongPress: e => {
      setchartPageSelecedData(prev => ({...prev, playerId: undefined, groupIdx: e.groupIdx + 1}))
    },
    ms: 600,
  })

  return (
    <Scatter
      {...handleLongPress}
      onMouseEnter={e => {
        setTimeout(() => {
          setactiveGroupIdx(e.groupIdx)
        }, 50)
      }}
      onMouseLeave={e => {
        setTimeout(() => {
          setactiveGroupIdx(null)
        }, 500)
      }}
      name="A school"
      data={data}
      shape={props => {
        const {cx, cy, payload} = props
        const {Student} = payload

        const {color, backgroundColor} = getColorStyles(payload?.color)
        const styles = getShapeProps(props, backgroundColor)
        const isLighten = activeGroupIdx !== null && payload.groupIdx !== activeGroupIdx
        const isbeingPressed = payload.id === event?.id
        const transparent = isbeingPressed || isLighten

        return (
          <g className={cl(' cursor-pointer', isBeingPressed ? 'bg-black ' : '')}>
            <circle {...{...styles.circle, cursor: 'pointer'}} />
            <text
              {...{
                ...styles.text,
                // fill: transparent ? 'transparent' : color,
                fillOpacity: transparent ? 0.1 : 1,
              }}
            >
              {shorten(Student?.name, 2, '')}
            </text>
          </g>
        )
      }}
    >
      {data.map((entry, index) => {
        const isLighten = activeGroupIdx !== null && entry.groupIdx !== activeGroupIdx
        const isbeingPressed = entry.id === event?.id
        const transparent = isbeingPressed || isLighten
        const {backgroundColor, color} = getColorStyles(entry?.color)

        return (
          <Cell
            key={index}
            {...{
              fill: transparent ? backgroundColor + '10' : backgroundColor,
            }}
          />
        )
      })}
    </Scatter>
  )
}
