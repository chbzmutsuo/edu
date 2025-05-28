import {IconBtn} from '@components/styles/common-components/IconBtn'
import {Paper} from '@components/styles/common-components/paper'
import MyPopover from '@components/utils/popover/MyPopover'
import React from 'react'

export default function RoleControll(props: {Game; Student; LearningRoleMasterOnGame; editable?: any; answer}) {
  const {Game, Student, LearningRoleMasterOnGame, editable, answer} = props

  const role = Student.roleInGroup

  const roleColor = Game?.LearningRoleMasterOnGame?.find(d => {
    return d.name === role
  })?.color

  const btn = (
    <IconBtn className={`onHover p-0.5! text-[12px]`} color={roleColor} rounded={false}>
      {role}
    </IconBtn>
  )

  if (!editable) {
    return btn
  } else {
    const {groups, setgroups} = editable ?? {}
    const squadIdx = groups?.findIndex(squad => squad.find(s => s.Student.id === Student.id))
    const studentIdx = groups[squadIdx].findIndex(s => s.Student.id === Student.id)
    return (
      <MyPopover button={btn} mode={`click`}>
        <Paper className="p-2">
          <div>
            <strong>変更する役割を選択してください</strong>
          </div>
          <select
            value={role}
            className={` myFormControl w-[200px]`}
            onChange={async e => {
              const newRole = e.target.value
              setgroups(prev => {
                return prev.map((group, i) => {
                  if (i === squadIdx) {
                    return group.map((student, j) => {
                      if (j === studentIdx) {
                        // studentオブジェクトをコピーして新しい値を設定
                        return {
                          ...student,
                          Student: {
                            ...student.Student,
                            roleInGroup: newRole,
                          },
                        }
                      }
                      return student
                    })
                  }
                  return group // これを忘れないように
                })
              })
            }}
          >
            {LearningRoleMasterOnGame.map((role, i) => {
              return (
                <option key={i} value={role.name}>
                  {role.name}
                </option>
              )
            })}
          </select>
        </Paper>
      </MyPopover>
    )
  }
}
