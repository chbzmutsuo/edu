import React, {Fragment} from 'react'

import {Circle, R_Stack} from 'src/cm/components/styles/common-components/common-components'

import {cl} from 'src/cm/lib/methods/common'

import {ArrowUpDownIcon} from 'lucide-react'
import useWindowSize from '@hooks/useWindowSize'
import {getColorStyles} from '@lib/methods/colors'

export const BodyLeftTh = ({myTable, showHeader, rowColor, dndProps, rowSpan, colSpan, recordIndex, children}) => {
  const {SP, PC} = useWindowSize()

  const className = cl(`p-0.5  items-center  gap-0.5 flex-nowrap`, showHeader && !SP ? `row-stack` : `col-stack gap-2`)
  return (
    <Fragment>
      <th
        style={{
          background: getColorStyles(rowColor).backgroundColor,
        }}
        {...{rowSpan, colSpan, className: ' p-0.5!    '}}
        {...dndProps}
      >
        <R_Stack className={`mx-auto px-1  flex-nowrap justify-around  gap-0`}>
          {myTable?.showRecordIndex === false ? <></> : <Circle width={24}>{recordIndex}</Circle>}
          <div className={className}>
            {dndProps && PC && <ArrowUpDownIcon className={`w-4`} />}
            {children}
          </div>
        </R_Stack>
      </th>
    </Fragment>
  )
}
