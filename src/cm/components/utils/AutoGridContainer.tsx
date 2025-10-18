import React from 'react'
import {cn} from '../../shadcn/lib/utils'

interface AutoGridContainerProps {
  children: React.ReactNode
  className?: string
  maxCols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
    xl2?: number
  }
}

export const AutoGridContainer: React.FC<AutoGridContainerProps> = ({
  children,
  className,
  maxCols = {
    md: 2,
    lg: 3,
    xl: 4,
  },
}) => {
  const childrenArray = React.Children.toArray(children)
  const childCount = childrenArray.length

  // 各ブレークポイントでの最大列数を子要素数に応じて調整
  const getAdjustedCols = (maxColsForBreakpoint: number) => {
    return Math.min(childCount, maxColsForBreakpoint)
  }

  // 動的なグリッドクラスを生成（静的なクラス名を使用）
  const generateGridClasses = () => {
    const classes = ['inline-grid']

    // デフォルトは1列
    classes.push('grid-cols-[repeat(1,auto)]')

    // smブレークポイント
    if (maxCols.sm && childCount > 1) {
      const adjustedCols = getAdjustedCols(maxCols.sm)
      if (adjustedCols === 1) classes.push('sm:grid-cols-[repeat(1,auto)]')
      else if (adjustedCols === 2) classes.push('sm:grid-cols-[repeat(2,auto)]')
      else if (adjustedCols === 3) classes.push('sm:grid-cols-[repeat(3,auto)]')
      else if (adjustedCols === 4) classes.push('sm:grid-cols-[repeat(4,auto)]')
      else if (adjustedCols === 5) classes.push('sm:grid-cols-[repeat(5,auto)]')
      else if (adjustedCols === 6) classes.push('sm:grid-cols-[repeat(6,auto)]')
    }

    // mdブレークポイント（指定されている場合）
    if (maxCols.md && childCount > (maxCols.sm || 1)) {
      const adjustedCols = getAdjustedCols(maxCols.md)
      if (adjustedCols === 1) classes.push('md:grid-cols-[repeat(1,auto)]')
      else if (adjustedCols === 2) classes.push('md:grid-cols-[repeat(2,auto)]')
      else if (adjustedCols === 3) classes.push('md:grid-cols-[repeat(3,auto)]')
      else if (adjustedCols === 4) classes.push('md:grid-cols-[repeat(4,auto)]')
      else if (adjustedCols === 5) classes.push('md:grid-cols-[repeat(5,auto)]')
      else if (adjustedCols === 6) classes.push('md:grid-cols-[repeat(6,auto)]')
    }

    // lgブレークポイント
    if (maxCols.lg && childCount > (maxCols.md || maxCols.sm || 1)) {
      const adjustedCols = getAdjustedCols(maxCols.lg)
      if (adjustedCols === 1) classes.push('lg:grid-cols-[repeat(1,auto)]')
      else if (adjustedCols === 2) classes.push('lg:grid-cols-[repeat(2,auto)]')
      else if (adjustedCols === 3) classes.push('lg:grid-cols-[repeat(3,auto)]')
      else if (adjustedCols === 4) classes.push('lg:grid-cols-[repeat(4,auto)]')
      else if (adjustedCols === 5) classes.push('lg:grid-cols-[repeat(5,auto)]')
      else if (adjustedCols === 6) classes.push('lg:grid-cols-[repeat(6,auto)]')
    }

    // xlブレークポイント
    if (maxCols.xl && childCount > (maxCols.lg || maxCols.md || maxCols.sm || 1)) {
      const adjustedCols = getAdjustedCols(maxCols.xl)
      if (adjustedCols === 1) classes.push('xl:grid-cols-[repeat(1,auto)]')
      else if (adjustedCols === 2) classes.push('xl:grid-cols-[repeat(2,auto)]')
      else if (adjustedCols === 3) classes.push('xl:grid-cols-[repeat(3,auto)]')
      else if (adjustedCols === 4) classes.push('xl:grid-cols-[repeat(4,auto)]')
      else if (adjustedCols === 5) classes.push('xl:grid-cols-[repeat(5,auto)]')
      else if (adjustedCols === 6) classes.push('xl:grid-cols-[repeat(6,auto)]')
    }

    // 2xlブレークポイント
    if (maxCols['2xl'] && childCount > (maxCols.xl || maxCols.lg || maxCols.md || maxCols.sm || 1)) {
      const adjustedCols = getAdjustedCols(maxCols['2xl'])
      if (adjustedCols === 1) classes.push('2xl:grid-cols-[repeat(1,auto)]')
      else if (adjustedCols === 2) classes.push('2xl:grid-cols-[repeat(2,auto)]')
      else if (adjustedCols === 3) classes.push('2xl:grid-cols-[repeat(3,auto)]')
      else if (adjustedCols === 4) classes.push('2xl:grid-cols-[repeat(4,auto)]')
      else if (adjustedCols === 5) classes.push('2xl:grid-cols-[repeat(5,auto)]')
      else if (adjustedCols === 6) classes.push('2xl:grid-cols-[repeat(6,auto)]')
    }

    return classes.join(' ')
  }

  return <div className={cn(generateGridClasses(), className)}>{children}</div>
}

export default AutoGridContainer
