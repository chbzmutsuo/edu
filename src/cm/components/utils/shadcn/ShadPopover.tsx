'use client'

import * as Popover from '@radix-ui/react-popover'
// import {Popover, PopoverContent, } from '@app/components/ui/popover'

import React from 'react'
import {Z_INDEX} from '@lib/constants/constants'
import {JSX} from 'react'
const ShadPopover = React.memo(
  (props: {
    PopoverTrigger?: JSX.Element | string
    open?: boolean
    onOpenChange?: any
    onOpenAutoFocus?: any
    children: JSX.Element
  }) => {
    const {PopoverTrigger, open, onOpenChange, children, onOpenAutoFocus = e => e.preventDefault()} = props

    return (
      <Popover.Root {...{open, onOpenChange}}>
        <Popover.Trigger>{PopoverTrigger}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            onOpenAutoFocus={onOpenAutoFocus}
            className="PopoverContent  rounded-lg    bg-white p-0.5  shadow-md "
            sideOffset={5}
            style={{zIndex: Z_INDEX.max}}
          >
            <div style={{zIndex: Z_INDEX.max}}>{children}</div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    )
  }
)

export default ShadPopover
