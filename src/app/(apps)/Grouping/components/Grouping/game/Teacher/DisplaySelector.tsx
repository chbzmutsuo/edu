import React from 'react'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import {Button} from '@components/styles/common-components/Button'

export const DisplaySelector = ({selectors}) => (
  <C_Stack className={`items-center`}>
    {selectors.map((selector, idx) => {
      return (
        <div key={idx}>
          <Button className={`w-[160px]`} onClick={selector.handleToggleSelect} color={`red`} active={!!selector.isActive}>
            {selector.label}
          </Button>
        </div>
      )
    })}
  </C_Stack>
)
