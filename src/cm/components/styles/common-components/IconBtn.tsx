import React, {useMemo} from 'react'
import {htmlProps} from '@cm/components/styles/common-components/type'
import {colorVariants, getColorStyles} from '@cm/lib/methods/colors'
import {CSSProperties} from 'react'

import {twMerge} from 'tailwind-merge'
import {tv} from 'tailwind-variants'

export const IconBtnBaseClass = ` rounded-full px-2 py-0.5  text-[15px]  `

export const IconBtn = React.memo(
  (
    props: htmlProps & {
      color?: colorVariants | string
      active?: boolean
      vivid?: boolean
      rounded?: boolean
      disabled?: boolean
    }
  ) => {
    const {className, style, color, active = true, vivid = true, rounded = false, children, ...rest} = props

    const colorUndetected = !iconBtnColorVariants[color ?? ''] && color

    const customeStyle = useMemo(() => {
      if (vivid && color) {
        return {
          ...getColorStyles(color ? color + '90' : ''),
          border: '2px solid ' + color,
        }
      }

      if (colorUndetected) {
        return {
          background: color + '40',
          color: color,
          border: '1px solid ' + color,
        }
      }
      return {}
    }, [vivid, color, colorUndetected])

    const classNameOutput = tv({
      base: twMerge(color ? `shadow-2xs border-[0.5px]  inline-block` : '', IconBtnBaseClass, className),
      variants: {
        color: iconBtnColorVariants,
        active: {false: 'opacity-30', true: 'opacity-100'},
        rounded: {false: 'rounded'},
        vivid: {true: 'text-inherit bg-inherit border-inherit'},
        disabled: {true: 'disabled !cursor-not-allowed'},
      },
      defaultVariants: {
        color: '',
        rounded: true,
        active: true,
        vivid: false,
        disabled: false,
      },
    })({color: color as any, active, rounded, disabled: props.disabled})

    return (
      <div className={classNameOutput} style={{...customeStyle, ...style}} disabled={props.disabled} {...rest}>
        {children}
      </div>
    )
  }
)

export const CircledIcon = React.memo(
  (
    props: htmlProps & {
      size?: 'md' | 'lg'
      color?: colorVariants
      active?: boolean
      inline?: boolean
      icon?
    }
  ) => {
    const {icon, className, style, color = `gray`, active, inline, type = `button`, size = `md`, ...rest} = props

    const sizeClass = size === `md` ? `h-5 w-5 p-[1px]` : `h-8 w-8 p-1`
    return (
      <button
        {...rest}
        {...{color, active, inline, type}}
        style={{...style}}
        className={twMerge(sizeClass, `  rounded-full  shadow-xs`, className)}
      >
        {icon ?? props.children}
      </button>
    )
  }
)

export const IconBtnForSelect = React.memo(
  (props: {children: React.ReactNode; color?: colorVariants; className?: string; style?: CSSProperties}) => {
    const {children, color, className, style} = props

    return (
      <IconBtn color={color} style={style} className={twMerge(`rounded-sm text-gray-800! p-0.5! px-1! text-sm!`, className)}>
        {children}
      </IconBtn>
    )
  }
)

export const iconBtnColorVariants: {[key in colorVariants]: string} = {
  gray: 'bg-gray-200 text-gray-700 shadow-gray-400 border-gray-400',
  red: 'bg-red-100 text-red-700 shadow-red-400 border-red-400',
  blue: 'bg-sky-50 text-sky-700 shadow-sky-400 border-sky-400',
  green: 'bg-green-50 text-green-800 shadow-green-400 border-green-500',
  orange: 'bg-orange-100 text-orange-700 shadow-orange-400 border-orange-400',
  yellow: 'bg-amber-100 text-amber-800 shadow-amber-400 border-amber-400',
  sub: 'bg-gray-600 text-gray-100 shadow-gray-400 border-gray-400',
  primary: 'bg-primary-light text-sub-main shadow-primary-main border-primary-main',
  transparent: 'bg-gray-200 text-gray-700 shadow-gray-400 border-gray-400 opacity-70 hover:!opacity-70 ',
  '': '',
}
