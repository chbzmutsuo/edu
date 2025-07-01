'use client '
import React from 'react'

import {cl} from '@cm/lib/methods/common'
import {Fragment} from 'react'
import {GameContextType} from '@app/(apps)/Grouping/components/Grouping/game/GameMainPage'
import {ClassRoom, Grouping} from '@app/(apps)/Grouping/class/Grouping'

import MyPopover from '@cm/components/utils/popover/MyPopover'

import {Circle, C_Stack, R_Stack} from '@components/styles/common-components/common-components'

import {jotai_moveStudent, useJotai} from '@hooks/useJotai'

import MemberSwitchTd from '@app/(apps)/Grouping/components/Grouping/game/Teacher/GroupHandler/GroupViewer/MemberSwitchTd'
import RoleControll from '@app/(apps)/Grouping/components/Grouping/game/Teacher/GroupHandler/GroupViewer/RoleControll'
import {IconBtn} from '@components/styles/common-components/IconBtn'

export default function GroupViewer(props: {
  GameCtxValue: GameContextType
  groupsWithRoles: any
  forStudent?: boolean
  studentId?: number
  editable?: {
    groups: any
    setgroups: any
  }
}) {
  const [moveStudent, setmoveStudent] = useJotai(jotai_moveStudent)

  const {GameCtxValue, groupsWithRoles, forStudent = false, studentId, editable} = props
  const headerClass = ` text-center text-xs`

  const {Game, players} = GameCtxValue as GameContextType
  const roleMaster = Object.keys(Grouping.ROLES).map(key => {
    const value = Grouping.ROLES[key]
    return {...value, name: key}
  })

  const LearningRoleMasterOnGame = Game.LearningRoleMasterOnGame

  const teacherOnly = forStudent === false

  const switchStudent = SquadIndex => {
    if (editable) {
      const {groups, setgroups} = editable ?? {}
      const allSquads = groups
      const currentGroup = [...groups]
      const Destination_index1 = SquadIndex

      const Source_index = allSquads.findIndex(squad => squad.find(s => s.Student.id === moveStudent?.id))
      const sourceStudent = currentGroup[Source_index]?.find(s => s.Student.id === moveStudent?.id)
      currentGroup[Destination_index1].push(sourceStudent)

      currentGroup[Source_index] = currentGroup[Source_index]?.filter(s => s.Student.id !== moveStudent?.id)
      setgroups(currentGroup)
      setmoveStudent(null)
    }
  }

  const totalCount = groupsWithRoles.reduce((acc, cur) => acc + cur.length, 0)

  return (
    <>
      <div className={` 3xl:columns-3 mx-auto gap-8 xl:columns-2 `}>
        {groupsWithRoles.map((squad, i) => {
          if (squad.length === 0) {
            return
          }

          const groupName = i + 1
          return (
            <div className={`   w-[420px]  max-w-[90vw]   p-1 py-4`} key={i}>
              <div
                className={cl(`t-paper  table-wrapper w-full  overflow-auto `, `[&_td]:border-y-[1px]! [&_th]:border-y-[1px]!`)}
              >
                <div
                  onClick={() => switchStudent(i)}
                  className={cl(`bg-gray-300  text-center`, moveStudent ? `onHover  animate-pulse bg-orange-300 ` : ``)}
                >
                  {groupName} ({squad.length}名)
                </div>

                <table>
                  <thead className={`sticky top-0 `}>
                    <tr className={headerClass}>
                      {editable && <th></th>}
                      <th className={`max-w-[220px]`}>氏名</th>
                      {teacherOnly && (
                        <>
                          <th className={`w-[60px]`}>
                            <div>好奇心</div>
                            <div>効力感</div>
                          </th>
                          {/* <th className={`w-[45px]`}>効力感</th> */}
                        </>
                      )}
                      <th>役割</th>
                      {teacherOnly && <th className={`w-[180px]`}>コメント</th>}
                      {teacherOnly && (
                        <th className={`w-[40px] `}>
                          <div>授業</div>
                          <div>評価</div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {squad.map((answer, j) => {
                      const {curiocity, efficacy, lessonSatisfaction} = answer

                      const absent = Game.absentStudentIds.includes(answer.Student.id)

                      let Student = answer.Student
                      const findStudentFromPlayerArr = players.find(p => p.id === Student.id)
                      Student = {...answer.Student, ...findStudentFromPlayerArr}

                      const isOutSideClass = (() => {
                        let isOutSideClass = ''
                        // let isOutsideThreshold: any = false

                        if (efficacy > curiocity + 9) {
                          isOutSideClass = `bg-blue-700 bg-opacity-70`
                        } else if (curiocity > efficacy + 9) {
                          isOutSideClass = `bg-red-700 bg-opacity-70`
                        }
                        return isOutSideClass
                      })()

                      const Comment = () => {
                        const comments = Grouping.getStudentComments({
                          Game,
                          Student,
                        })
                        if (comments.length === 0) return <small>コメントがありません</small>
                        return (
                          <>
                            {comments?.map((answer, idx) => {
                              return (
                                <div key={idx} className={`mb-2 max-w-[200px] truncate`}>
                                  {idx + 1}. {answer.comment}
                                </div>
                              )
                            })}
                          </>
                        )
                      }

                      const isMoveCandidate = moveStudent?.id === Student.id
                      const iconClass = `onHover w-5`

                      return (
                        <Fragment key={Student.id}>
                          <tr
                            className={cl(
                              isMoveCandidate ? `bg-orange-400 font-bold` : ``,
                              `text-center`,
                              studentId === Student.id ? `bg-primary-main text-white` : ``,
                              absent ? `opacity-50 pointer-events-none bg-sub-main/50 ` : '',
                              teacherOnly && isOutSideClass
                            )}
                          >
                            {editable && (
                              <td>
                                <MemberSwitchTd
                                  {...{Student, editable, iconClass, isMoveCandidate, moveStudent, setmoveStudent}}
                                />
                              </td>
                            )}
                            <td>
                              <C_Stack className={`gap-0`}>
                                <R_Stack>
                                  <small>{new ClassRoom(Student?.Classroom).className}</small>
                                  <small>{absent && '[休]'}</small>
                                  <div className={`w-[20px]`}>
                                    {Student.gender && (
                                      <IconBtn
                                        className={`rounded-full text-xs opacity-70`}
                                        color={Student.gender === `男` ? `blue` : `red`}
                                      >
                                        {Student.gender}
                                      </IconBtn>
                                    )}
                                  </div>
                                </R_Stack>
                                <R_Stack className={`gap-0.5`}>{Student.name}</R_Stack>
                              </C_Stack>
                            </td>
                            {teacherOnly && (
                              <td>
                                <C_Stack className={`gap-1`}>
                                  <Circle width={18} color={`red`} className={`text-sm`}>
                                    {curiocity}
                                  </Circle>
                                  <Circle width={18} color={`blue`} className={`text-sm`}>
                                    {efficacy}
                                  </Circle>
                                </C_Stack>
                              </td>
                            )}

                            <td>
                              <RoleControll
                                {...{
                                  answer,
                                  Game,
                                  Student,
                                  LearningRoleMasterOnGame,
                                  editable,
                                }}
                              />
                            </td>
                            {teacherOnly && (
                              <td>
                                <MyPopover
                                  positionFree
                                  button={
                                    <div className={`h-[40px] overflow-hidden     text-start text-xs`}>
                                      <Comment />
                                    </div>
                                  }
                                >
                                  <div className={`t-paper`}>
                                    <Comment />
                                  </div>
                                </MyPopover>
                              </td>
                            )}
                            {teacherOnly && <td>{lessonSatisfaction} </td>}
                          </tr>
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
