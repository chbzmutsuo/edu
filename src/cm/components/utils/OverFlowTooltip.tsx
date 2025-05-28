import {Center, R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {IconBtn} from 'src/cm/components/styles/common-components/IconBtn'
IconBtn
import MyPopover from 'src/cm/components/utils/popover/MyPopover'
import {InformationCircleIcon} from '@heroicons/react/20/solid'
import useElementRef from 'src/cm/hooks/useElementRef'

import React from 'react'

export const OverFlowTooltip = React.memo(
  ({maxWidth, maxHeight, children}: {maxWidth: number; maxHeight: number; children: React.ReactNode}) => {
    const outerRef = useElementRef()

    const ellipsis = (() => {
      const outerWidth = outerRef.TargetElementRef?.current?.getBoundingClientRect()?.width
      const outerHeihgt = outerRef.TargetElementRef?.current?.getBoundingClientRect()?.height
      const ellipsis = !!((maxWidth && outerWidth >= maxWidth) || (maxHeight && outerHeihgt >= maxHeight))
      return ellipsis
    })()
    const commonProps = {
      className: ` w-full px-0.5`,
      style: {maxWidth, maxHeight, overflow: 'hidden', cursor: ellipsis ? 'pointer' : 'auto'},
    }

    const Origin = () => (
      <div ref={outerRef.TargetElementRef} {...commonProps}>
        {children}
      </div>
    )

    if (!ellipsis) return <Origin />
    return (
      <MyPopover
        childrenWidth={maxWidth}
        positionFree
        button={
          <R_Stack className={`w-full    cursor-pointer flex-wrap`}>
            <Origin />
            {ellipsis && (
              <InformationCircleIcon className={` text-shadow-md absolute right-1 top-1   w-5 font-bold  text-blue-400`} />
            )}
          </R_Stack>
        }
      >
        <Center className={` max-w-[85vw] overflow-auto bg-white p-2`}>{children}</Center>
      </MyPopover>
    )
  }
)
