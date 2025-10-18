import {useState} from 'react'

import React from 'react'

import {GameContextType} from '@app/(apps)/edu/Grouping/components/Grouping/game/GameMainPage'
import {ClassRoom} from '@app/(apps)/edu/class/Grouping'
import {CenterScreen} from '@cm/components/styles/common-components/common-components'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {CsvTable} from '@cm/components/styles/common-components/CsvTable/CsvTable'

export default function PlayerSelector({GameCtxValue}) {
  const {players, player, Game, isTeacher} = GameCtxValue as GameContextType

  const {session, accessScopes, addQuery} = useGlobal()

  const scopes = accessScopes()
  const [showStudentSelectors, setshowStudentSelectors] = useState<any>(null)

  const loginAsTeacher = type => {
    if (!scopes.admin && (!scopes.login || !session.scopes.getGroupieScopes().teacherId)) {
      alert('教員でログインしてください')
      return
    }
    addQuery({as: 'teacher'})
  }

  return (
    <div className={` mx-auto    text-center`}>
      {!showStudentSelectors && (
        <CenterScreen>
          <div>
            <h1>プレイヤーを選択してください</h1>
            <div className={`row-stack mx-auto justify-around `}>
              <>
                {isTeacher && (
                  <div
                    className={`row-stack detectHover bg-primary-main rounded-full p-2  text-lg text-white`}
                    onClick={e => {
                      loginAsTeacher('teacher')
                    }}
                  >
                    教員
                  </div>
                )}

                <div
                  className={`row-stack detectHover bg-primary-main rounded-full p-2  text-lg text-white`}
                  onClick={e => {
                    setshowStudentSelectors(true)
                  }}
                >
                  児童・生徒
                </div>
              </>
            </div>
          </div>
        </CenterScreen>
      )}
      {showStudentSelectors && (
        <div>
          <h2>児童・生徒を選択してください</h2>
          {CsvTable({
            records: players?.map(student => {
              return {
                csvTableRow: [
                  {
                    label: '選択',
                    cellValue: (
                      <button
                        className={`t-btn my-3`}
                        onClick={e => {
                          addQuery({as: 'student', sid: student.id})
                        }}
                      >
                        選択
                      </button>
                    ),
                  },
                  {
                    label: 'クラス',
                    cellValue: `${new ClassRoom(student?.Classroom).className}-${student.attendanceNumber}`,
                  },
                  {
                    label: '名前',
                    cellValue: student.name,
                  },
                ],
              }
            }),
          }).WithWrapper({})}
        </div>
      )}
    </div>
  )
}
