import React from 'react'
import {cn} from '../../shadcn-ui/lib/utils'

type DynamicGridContainerProps = {
  children: React.ReactNode
  className?: string
  gap?: string
  maxCols?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
} & React.ComponentProps<'div'>

export const DynamicGridContainer: React.FC<DynamicGridContainerProps> = ({
  children,
  className,
  gap = 'gap-8',
  maxCols = {base: 1, sm: 2, lg: 3, xl: 4},
  ...props
}) => {
  const childrenArray = React.Children.toArray(children)
  const childCount = childrenArray.length

  // 子要素数に応じて列数を調整
  const getGridCols = (maxColsForBreakpoint: number) => {
    return Math.min(childCount, maxColsForBreakpoint)
  }

  // グリッドクラスのマッピング
  const gridColsMap: {[key: number]: string} = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
  }

  // レスポンシブグリッドクラスを生成
  const generateResponsiveGridClasses = () => {
    const classes = ['grid']

    // ベースサイズ
    if (maxCols.base) {
      const cols = getGridCols(maxCols.base)
      classes.push(gridColsMap[cols] || 'grid-cols-1')
    }

    // smブレークポイント
    if (maxCols.sm) {
      const cols = getGridCols(maxCols.sm)
      classes.push(`sm:${gridColsMap[cols] || 'grid-cols-1'}`)
    }

    // mdブレークポイント
    if (maxCols.md) {
      const cols = getGridCols(maxCols.md)
      classes.push(`md:${gridColsMap[cols] || 'grid-cols-1'}`)
    }

    // lgブレークポイント
    if (maxCols.lg) {
      const cols = getGridCols(maxCols.lg)
      classes.push(`lg:${gridColsMap[cols] || 'grid-cols-1'}`)
    }

    // xlブレークポイント
    if (maxCols.xl) {
      const cols = getGridCols(maxCols.xl)
      classes.push(`xl:${gridColsMap[cols] || 'grid-cols-1'}`)
    }

    // 2xlブレークポイント
    if (maxCols['2xl']) {
      const cols = getGridCols(maxCols['2xl'])
      classes.push(`2xl:${gridColsMap[cols] || 'grid-cols-1'}`)
    }

    return classes.join(' ')
  }

  return (
    <div {...props} className={cn(generateResponsiveGridClasses(), gap, className)}>
      {children}
    </div>
  )
}

export default DynamicGridContainer
