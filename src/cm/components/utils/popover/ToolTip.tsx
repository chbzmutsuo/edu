import React, {useRef} from 'react'

// ツールチップ内に表示するためのprops
type Props = {
  tooltipText: any
}

// ツールチップ
export const Tooltip = React.memo((props: any) => {
  // ツールチップの文言自体のためのref
  const ref = useRef<HTMLDivElement>(null)

  // マウスが乗ったらツールチップを表示
  const handleMouseEnter = () => {
    if (!ref.current) return
    ref.current.style.opacity = '1'
    ref.current.style.visibility = 'visible'
  }
  // マウスが離れたらツールチップを非表示
  const handleMouseLeave = () => {
    if (!ref.current) return
    ref.current.style.opacity = '0'
    ref.current.style.visibility = 'hidden'
  }

  return (
    <div className="relative flex items-center">
      <div
        className="invisible absolute left-1/2 top-full z-10 mx-auto mt-2 flex -translate-x-1/2 transform items-center whitespace-nowrap rounded-sm bg-black px-2 py-[2px] text-xs text-white transition-all duration-150 before:absolute before:-top-1 before:left-1/2 before:z-0 before:block before:h-2 before:w-2 before:-translate-x-1/2 before:rotate-45 before:transform before:bg-black"
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {props.tooltipText}
      </div>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {props.children}
      </div>
    </div>
  )
})

Tooltip.displayName = 'Tooltip'
