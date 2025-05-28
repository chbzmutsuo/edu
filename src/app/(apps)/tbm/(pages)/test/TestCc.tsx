'use client'
import React from 'react'
import {getMidnight} from '@class/Days/date-utils/calculations'
import {formatDate} from '@class/Days/date-utils/formatters'

export default function TestCc() {
  return <div>{formatDate(getMidnight(), 'YYYY-MM-DD', true)}</div>
}
