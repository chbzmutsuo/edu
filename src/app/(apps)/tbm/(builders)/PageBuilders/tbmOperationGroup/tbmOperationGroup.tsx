'use client'

import {DetailPagePropType} from '@cm/types/types'
import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'
import {useState} from 'react'

export const tbmOperationGroup = {
  form: (props: DetailPagePropType) => {
    const [setNewFormDate, setsetNewFormDate] = useState(false)
    const {formData, setformData} = props

    // const transformed = transformTbmOperationData(formData)

    // useEffect(() => {
    //   if (!setNewFormDate) {
    //     setformData(transformed)
    //     setsetNewFormDate(true)
    //   }
    // }, [transformed])

    return <MyForm {...{...props}} />
  },
}
