import UnfitStudentSelector from '@app/(apps)/Grouping/components/Grouping/UnfitStudentSelector'
import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'

import React from 'react'
import {DetailPagePropType} from '@cm/types/types'

const StudentDetailById = (props: DetailPagePropType) => {
  const {formData: Student, myForm} = props

  return (
    <div>
      <BasicTabs
        {...{
          id: 'StudentDetailById',
          TabComponentArray: [
            {label: '基本情報', component: <MyForm {...{...props}} />},
            {
              label: '要配慮指定',
              component: <UnfitStudentSelector {...{Student}} />,
            },
          ],
        }}
      />
    </div>
  )
}
export default StudentDetailById
