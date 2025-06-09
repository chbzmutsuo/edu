import {cl} from 'src/cm/lib/methods/common'

import React from 'react'
import {anyObject} from '@cm/types/utility-types'
import {getColorStyles} from '@lib/methods/colors'

const MyRating = React.forwardRef((props: anyObject, ref) => {
  const {min = 1, max = 10, records, col, liftUpNewValueOnChange, currentValue, Register, formProps, ReactHookForm} = props
  const {setValue} = ReactHookForm

  const buttons: number[] = []
  for (let i = min; i <= max; i++) {
    buttons.push(i)
  }

  // 使用例
  const gradientColors = generateGradient('#EA3323', '#8EFA00', buttons.length)
  return (
    <div className={`row-stack justify-around`}>
      <input {...Register} type="hidden" />
      {buttons.map(i => {
        const bgColor = gradientColors[i - 1]

        const selected = currentValue === i

        return (
          <button
            type="button"
            key={i}
            style={{...getColorStyles(bgColor)}}
            className={cl(
              `icon-btn  h-10 w-10 px-2 text-lg  `,
              selected ? 'scale-150 border-4 border-double opacity-100' : 'opacity-60'
            )}
            onClick={e => {
              setValue(col.id, i)
            }}
          >
            {i}
          </button>
        )
      })}
    </div>
  )
})

export default MyRating

function generateGradient(colorStart, colorEnd, colorCount) {
  // スタート・エンドのカラーコードをRGBに変換
  const start = hexToRgb(colorStart)
  const end = hexToRgb(colorEnd)

  const colors: string[] = []

  for (let i = 0; i < colorCount; i++) {
    const r = ensureBrightness(interpolate(start?.r, end?.r, i, colorCount))
    const g = ensureBrightness(interpolate(start?.g, end?.g, i, colorCount))
    const b = ensureBrightness(interpolate(start?.b, end?.b, i, colorCount))
    colors.push(rgbToHex(r, g, b))
  }

  return colors.map(color => String(color).replace(/\.+.+/g, ''))
  // RGBを明るさが一定以上になるように調整
  function ensureBrightness(color) {
    return Math.max(color, 70)
  }

  // 16進数のカラーコードをRGBに変換
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  // RGBを16進数のカラーコードに変換
  function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  // 線形補間の計算
  function interpolate(start, end, step, maxStep) {
    if (start < end) {
      return start + ((end - start) * step) / maxStep
    } else {
      return start - ((start - end) * step) / maxStep
    }
  }
}
