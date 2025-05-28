'use client'

import {cl} from 'src/cm/lib/methods/common'

import {useEffect, useState} from 'react'
import MyForm from 'src/cm/components/DataLogic/TFs/MyForm/MyForm'

import {ClientPropsType2} from 'src/cm/components/DataLogic/TFs/PropAdjustor/PropAdjustor'

const DetailedPageCC = (props: {modelData: any; ClientProps2: ClientPropsType2}) => {
  const {modelData, ClientProps2} = props

  const {myForm, EditForm, dataModelName} = ClientProps2

  if (!modelData) return <div>このページは存在しません</div>

  const [formData, setformData] = useState(modelData)

  useEffect(() => {
    if (modelData) {
      setformData(modelData)
    }
  }, [modelData])

  ClientProps2.formData = modelData
  ClientProps2.setformData = setformData

  return (
    <div className={cl(`mx-auto w-fit p-1.5`)}>
      {/* //paperはつけない */}
      <>
        <div className={`p-0.5`} id={`${dataModelName}-formMemo-${EditForm ? 'Custom' : 'Normal'}`}>
          {myForm?.caption}
          {EditForm ? <EditForm {...{...ClientProps2}} /> : <MyForm {...{...ClientProps2}} />}
        </div>
      </>
    </div>
  )
}

export default DetailedPageCC
