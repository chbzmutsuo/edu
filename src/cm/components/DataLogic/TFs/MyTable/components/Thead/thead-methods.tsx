import {C_Stack, Center} from '@components/styles/common-components/common-components'
import {MarkDownDisplay} from '@components/utils/texts/MarkdownDisplay'
import useElementRef from 'src/cm/hooks/useElementRef'
import {twMerge} from 'tailwind-merge'
import React, {useMemo} from 'react'
import {colType} from '@cm/types/types'

// 型定義を追加
interface KadoProps {
  rowSpan?: number
  colSpan?: number
  style?: React.CSSProperties
  children: React.ReactNode
}

interface ThDisplayJSXProps {
  col: colType
  width?: number
}

export const Kado = React.memo<KadoProps>(({rowSpan, colSpan, style, children}) => {
  return (
    <th rowSpan={rowSpan} colSpan={colSpan} className="sticky left-0" style={style}>
      {children}
    </th>
  )
})

Kado.displayName = 'Kado'

export const ThDisplayJSX = React.memo<ThDisplayJSXProps>(({col}) => {
  const {TargetElementProps, TargetElementRef} = useElementRef({id: col?.id})

  // ✅ 条件分岐のある計算なのでメモ化有効
  const displayValue = useMemo(() => (col?.th?.format ? col?.th?.format(col) : col?.label), [col?.th?.format, col?.label, col])

  // ✅ 条件分岐のあるクラス名計算なのでメモ化有効
  const className = useMemo(() => twMerge(!col?.th?.divider && 'h-fit'), [col?.th?.divider])

  // ✅ 条件分岐のあるJSX要素なのでメモ化有効
  const displayElement = useMemo(() => {
    if (typeof displayValue === 'string') {
      return (
        <MarkDownDisplay className={className} ref={TargetElementRef}>
          {displayValue}
        </MarkDownDisplay>
      )
    } else {
      return (
        <div className={className} ref={TargetElementRef}>
          {displayValue}
        </div>
      )
    }
  }, [displayValue, className, TargetElementRef])

  return (
    <Center>
      <C_Stack className="items-center text-center">{displayElement}</C_Stack>
    </Center>
  )
})

ThDisplayJSX.displayName = 'ThDisplayJSX'
