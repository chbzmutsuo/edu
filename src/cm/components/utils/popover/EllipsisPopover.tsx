import {Paper} from '@components/styles/common-components/paper'
import MyPopover from '@components/utils/popover/MyPopover'
import React from 'react'

export default function EllipsisPopover({maxWidth, children}) {
  if (maxWidth) {
    const btn = (
      <div
        className={`onHover`}
        style={{
          maxWidth,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </div>
    )
    return (
      <MyPopover button={btn}>
        <Paper>{children}</Paper>
      </MyPopover>
    )
  } else {
    return children
  }
}
