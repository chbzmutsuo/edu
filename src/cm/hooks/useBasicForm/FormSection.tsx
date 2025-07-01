import {Card} from '@cm/shadcn-ui/components/ui/card'
import React from 'react'

export default function FormSection({columns, ControlOptions, children}) {
  const colFormIndexGroupName = ControlOptions?.showLabel === false ? undefined : columns[0]?.form?.colIndex
  return (
    <>
      {isNaN(colFormIndexGroupName) && colFormIndexGroupName ? (
        <>
          <Card variant="outline">
            <div className={`  text-primary-main text-center text-lg font-bold `}>{colFormIndexGroupName}</div>
            {children}
          </Card>
        </>
      ) : (
        children
      )}
    </>
  )
}
