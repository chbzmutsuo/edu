import React from 'react'
import {getMidnight} from '@cm/class/Days/date-utils/calculations'
import {formatDate} from '@cm/class/Days/date-utils/formatters'

import TestCc from './TestCc'

export default async function page() {
  const testData = [0, null, undefined, new Date(), formatDate(new Date(), 'YYYY-MM-DD'), '2025-01-01', 'gsagas', {}]

  return (
    <div>
      {formatDate(getMidnight(), 'YYYY-MM-DD', true)}
      <TestCc />
    </div>
  )
}
