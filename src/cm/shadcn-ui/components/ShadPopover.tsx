'use client'

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from '@cm/shadcn-ui/components/ui/drawer'
import {Popover, PopoverContent, PopoverTrigger} from '@cm/shadcn-ui/components/ui/popover'

import {useIsMobile} from '@cm/shadcn-ui/hooks/use-mobile'
import {PopoverPortal} from '@radix-ui/react-popover'

import React from 'react'
import {JSX} from 'react'

type ShadPopoverProps = {
  PopoverTrigger?: JSX.Element | string
  open?: boolean
  onOpenChange?: any
  onOpenAutoFocus?: any
  title?: string
  description?: string
  children: JSX.Element
  mode?: 'click' | 'hover'
}
const ShadPopover = React.memo((props: ShadPopoverProps) => {
  const {
    open,
    onOpenChange,
    PopoverTrigger: Trigger,
    children,
    onOpenAutoFocus = e => e.preventDefault(),
    title,
    description,
    mode = 'hover',
  } = props
  const mobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      setIsOpen(newOpen)
      if (onOpenChange) {
        onOpenChange(newOpen)
      }
    },
    [onOpenChange]
  )

  const handleMouseEnter = React.useCallback(() => {
    if (mode === 'click') return
    setIsOpen(true)
    if (onOpenChange) {
      onOpenChange(true)
    }
  }, [onOpenChange])

  const handleMouseLeave = React.useCallback(() => {
    if (mode === 'click') return
    setIsOpen(false)
    if (onOpenChange) {
      onOpenChange(false)
    }
  }, [onOpenChange])

  const isControlled = open !== undefined
  const openState = isControlled ? open : isOpen

  if (mobile) {
    return (
      <Drawer open={openState} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{Trigger}</DrawerTrigger>

        <DrawerPortal>
          <DrawerContent
            onOpenAutoFocus={onOpenAutoFocus}
            className="PopoverContent  rounded-lg  bg-white p-1  shadow-md border border-gray-200 "
          >
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription>{description}</DrawerDescription>
              </DrawerHeader>

              <div className={`w-fit mx-auto`}>{children}</div>

              <DrawerFooter></DrawerFooter>
            </div>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    )
  }

  return (
    <Popover open={openState} onOpenChange={handleOpenChange}>
      {Trigger && (
        <PopoverTrigger onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {Trigger}
        </PopoverTrigger>
      )}
      <PopoverPortal>
        <PopoverContent
          onOpenAutoFocus={onOpenAutoFocus}
          className="PopoverContent  p-3 w-fit  mx-auto  shadow-lg shadow-gray-500 border border-gray-200 bg-white"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`bg-white   `}>{children}</div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
})

ShadPopover.displayName = 'ShadPopover'
export default ShadPopover
