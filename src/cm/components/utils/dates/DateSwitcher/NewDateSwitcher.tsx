'use client'

import useGlobal from '@hooks/globalHooks/useGlobal'

import {useEffect} from 'react'

import useDateSwitcherFunc from '@components/utils/dates/DateSwitcher/useDateSwitcherFunc'

import {colType} from '@cm/types/types'
import {FitMargin} from '@components/styles/common-components/common-components'

const NewDateSwitcher = (props: {
  yearOnly?: boolean
  monthOnly?: boolean
  selectPeriod?: boolean
  selectMonth?: boolean
  additionalCols?: colType[]
}) => {
  const {query, width} = useGlobal()
  const {
    FormHook: {BasicForm, ReactHookForm, latestFormData},
    from,
    to,
  } = useDateSwitcherFunc(props)

  useEffect(() => {
    if (from) {
      ReactHookForm.setValue(`from`, from)
    }
    if (to) {
      ReactHookForm.setValue(`to`, to)
    }
  }, [query])

  return (
    <FitMargin>
      <BasicForm
        latestFormData={latestFormData}
        alignMode="row"
        ControlOptions={
          width > 600
            ? {ControlStyle: {width: 150, fontSize: 14}}
            : {LabelStyle: {fontSize: 14}, ControlStyle: {width: 145, fontSize: 14}}
        }
      ></BasicForm>
    </FitMargin>
  )
}
export default NewDateSwitcher
