'use client'
import {R_Stack} from 'src/cm/components/styles/common-components/common-components'

import React, {useMemo} from 'react'
import {cl} from 'src/cm/lib/methods/common'
import {DH__switchColType} from '@cm/class/DataHandler/type-converter'

export const DisplayedState = React.memo((props: {col; record; value}) => {
  const {col, record, value} = props
  const rStackClass = useMemo(() => getR_StackClass(), [col?.type])

  return (
    <R_Stack
      id={`${col.id}-${record.id}`}
      className={cl(`displayStateRStack`, `  h-full items-start  break-words  `, rStackClass)}
    >
      <div className={`text-start`}>{value}</div>
      {col.affix?.label && <div>{renderAffix()}</div>}
    </R_Stack>
  )

  function renderAffix() {
    return <span style={{marginLeft: 1, color: 'gray', fontSize: '0.6rem'}}>{col.affix.label}</span>
  }

  function getR_StackClass() {
    const convertedType = DH__switchColType({type: col.type})
    let rStackClass = `justify-center`
    switch (convertedType) {
      case 'number':
        rStackClass = 'justify-end'
        break
      case 'text':
        rStackClass = 'justify-start'
        break
    }
    if (col.type === 'selectId') {
      rStackClass = 'justify-start'
    }

    return rStackClass
  }
})
