'use client'
import MidTable from '@cm/components/DataLogic/RTs/MidTable/MidTable'

import {StudentClass} from '@app/(apps)/edu/class/Grouping'

import {useState} from 'react'
import {toast} from 'react-toastify'

import useDoStandardPrisma from '@cm/hooks/useDoStandardPrisma'
import {doTransaction} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'

const UnfitStudentSelector = props => {
  const {Student} = props

  const {toggleLoad, accessScopes} = useGlobal()
  const {schoolId} = accessScopes().getGroupieScopes()
  const [showModal, setshowModal] = useState(false)
  const {data: student, isLoading} = useDoStandardPrisma(
    'student',
    'findMany',
    {
      where: {schoolId},
    },
    {deps: []}
  )

  return (
    <div>
      <MidTable
        {...{
          ParentData: Student,
          candidates: student?.filter(s => s.id !== Student?.id),
          relation: 'manyToManyRecursive',
          recursive: true,
          models: {
            parent: 'student',
            mid: 'unfitFellow',
            // another: "Student",
          },
          groupBy: {
            keyArray: ['Classroom.grade', 'Classroom.class'],
            joinWith: '-',
          },
          keysToShow: {
            keyArray: ['attendanceNumber', 'name'],
            joinWith: '  ',
          },
          propsOverride: {
            handleConfirm: async props => {
              await toggleLoad(async () => {
                const {createArr, updateArr, deleteArr, initiallinkedData, linkedData} = props
                /**transaction queryの発行 */
                const transactionQueryList = [
                  ...createArr.map(s => {
                    const currentUnfitFellowTable = new StudentClass(Student).getUnfitFellowMidTableWith(s.id)

                    const currentTableId = currentUnfitFellowTable?.id ?? 0

                    const data = {
                      Student: {
                        connect: [{id: Student.id}, {id: s.id}],
                      },
                    }

                    return {
                      model: 'UnfitFellow',
                      method: 'upsert',
                      queryObject: {
                        where: {id: currentTableId},
                        create: data,
                        update: data,
                      },
                    }
                  }),
                  ...deleteArr.map(s => {
                    const currentUnfitFellowTable = new StudentClass(Student).getUnfitFellowMidTableWith(s.id)

                    return {
                      model: 'UnfitFellow',
                      method: 'delete',
                      queryObject: {
                        where: {
                          id: currentUnfitFellowTable.id,
                        },
                      },
                    }
                  }),
                ]
                await doTransaction({transactionQueryList})
                toast.success('更新しました')
                setshowModal(false)
              })
            },
          },
        }}
      />
    </div>
  )
}
export default UnfitStudentSelector
