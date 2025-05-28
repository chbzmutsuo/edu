import {Z_INDEX} from 'src/cm/lib/constants/constants'
import {Bars3Icon} from '@heroicons/react/20/solid'
import React, {useMemo, useCallback} from 'react'

type MenuButtonProps = {
  onClick: () => void
}

export const MenuButton = React.memo(({onClick}: MenuButtonProps) => {
  const iconStyle = useMemo(
    () => ({
      zIndex: Z_INDEX.appBar,
    }),
    []
  )

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onClick()
    },
    [onClick]
  )

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onClick()
    },
    [onClick]
  )

  return (
    <button id="menu-btn" type="button">
      <Bars3Icon
        style={iconStyle}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        className="text-primary-main mx-1 w-8 rounded-sm font-bold cursor-pointer"
      />
    </button>
  )
})

MenuButton.displayName = 'MenuButton'
