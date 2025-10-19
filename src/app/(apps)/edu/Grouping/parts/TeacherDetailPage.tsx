'use client'
import React from 'react'
import MidTable from '@cm/components/DataLogic/RTs/MidTable/MidTable'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import MyForm from '@cm/components/DataLogic/TFs/MyForm/MyForm'

import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {DetailPagePropType} from '@cm/types/types'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

export default function TeacherDetailPage(props: DetailPagePropType) {
  const {formData: teacher} = props
  const {accessScopes} = useGlobal()

  const schoolId = accessScopes().getGroupieScopes().schoolId
  const {data: classroom, isLoading} = useDoStandardPrisma('classroom', 'findMany', {where: {schoolId}}, {deps: []})

  return (
    <div className={`mx-auto `}>
      <BasicTabs
        {...{
          id: 'TeacherDetailPage',
          className: 'min-w-[1000px]',
          TabComponentArray: [
            {
              label: '基本情報',
              component: (
                <div>
                  <MyForm
                    {...{
                      ...props,
                    }}
                  />
                </div>
              ),
            },

            teacher?.id && {
              label: 'クラス',
              component: (
                <div>
                  <MidTable
                    {...{
                      ParentData: teacher,
                      candidates: classroom,
                      models: {
                        parent: 'teacher',
                        mid: 'teacherClass',
                        another: 'classroom',
                      },
                      uniqueRelationalKey: 'unique_teacherId_classroomId',
                      relation: 'manyToMany',
                      keysToShow: {
                        keyArray: ['grade', 'class'],
                        joinWith: '-',
                      },
                    }}
                  />
                </div>
              ),
            },
          ],
        }}
      />
    </div>
  )
}
