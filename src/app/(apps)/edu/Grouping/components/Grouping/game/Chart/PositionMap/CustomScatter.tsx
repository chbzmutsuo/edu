import {shorten} from '@cm/lib/methods/common'
import {Cell, Scatter} from 'recharts'

const CustomScatter = ({data, getShapeProps}) => {
  return (
    <Scatter
      // {...handleLongPress}

      name="A school"
      data={data}
      shape={props => {
        const {cx, cy, payload} = props
        const {color, Student} = payload
        const styles = getShapeProps(props, color)

        return (
          <g>
            <circle {...{...styles.circle}} />
            <text {...styles.text} alignmentBaseline="middle">
              {shorten(Student?.name, 3, '')}
            </text>
          </g>
        )
      }}
    >
      {data.map((entry, index) => {
        return <Cell key={`cell-${index}`} {...{fill: entry?.color}} />
      })}
    </Scatter>
  )
}

export default CustomScatter
