import {Fragment} from 'react'
import {Grouping} from '@app/(apps)/edu/class/Grouping'
import BasicModal from '@cm/components/utils/modal/BasicModal'

import Rank from './Rank'

import {anyObject} from '@cm/types/utility-types'

import SimpleTable from '@cm/components/utils/SimpleTable'
import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import {GameContextType} from '@app/(apps)/edu/Grouping/components/Grouping/game/GameMainPage'
import {TrophyIcon} from 'lucide-react'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {jotai_showAwards, useJotai} from '@cm/hooks/useJotai'
import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'

export default function Award({GameCtxValue}) {
  const {Game, activeGroup, teacherId} = GameCtxValue as GameContextType

  const [showAwards, setshowAwards] = useJotai(jotai_showAwards)

  const {SquadInSort, StudentInSort} = (() => {
    let StudentInSort: any[] = []
    const SQUAD_SCORE = {}

    activeGroup?.Squad?.forEach((squad, sq) => {
      const Student = squad.Student
      obj__initializeProperty(SQUAD_SCORE, squad.id, {
        first: {
          curiocity: 0,
          efficacy: 0,
          groupSatisfaction: 0,
        },
        last: {
          curiocity: 0,
          efficacy: 0,
        },
        validAnswerCount: 0,
        firstScore: 0,
        lastScore: 0,
        groupSatisfaction: 0,
        growthDifference: 0,
      })

      Student.map((student, st) => {
        const activeAnswerForStudent = Game.Answer.filter(a => a.studentId === student.id)?.filter(answer => {
          return Grouping.isActiveAnswer(answer)
        })
        // 各メンバーの初回および最終回のスコア計算
        const validAnswerCount = activeAnswerForStudent.length ?? 0
        const hisFirstAnswer = activeAnswerForStudent?.[0]
        const hisLastAnswer = activeAnswerForStudent?.[validAnswerCount - 1]

        const firstCE = Grouping.getCuriocityAndEfficacy(hisFirstAnswer)
        const lastCE = Grouping.getCuriocityAndEfficacy(hisLastAnswer)

        SQUAD_SCORE[squad.id].validAnswerCount += validAnswerCount
        SQUAD_SCORE[squad.id].first.efficacy += firstCE.efficacy
        SQUAD_SCORE[squad.id].last.curiocity += lastCE.curiocity
        SQUAD_SCORE[squad.id].last.efficacy += lastCE.efficacy

        /**初回と最終回のスコア */
        const firstScore = firstCE.curiocity + firstCE.efficacy
        const lastScore = lastCE.curiocity + lastCE.efficacy
        SQUAD_SCORE[squad.id].firstScore += firstScore
        SQUAD_SCORE[squad.id].lastScore += lastScore

        const summaryAnswer = Game.Answer.find(a => a.studentId === student.id && a.asSummary === true)

        // 満足度
        let groupSatisfaction = summaryAnswer?.lessonSatisfaction ?? 0
        groupSatisfaction = 0

        SQUAD_SCORE[squad.id].groupSatisfaction += groupSatisfaction

        /**成長幅 */
        const isValid = validAnswerCount >= 2
        const growthDifference = isValid ? lastScore - firstScore + groupSatisfaction : 0
        SQUAD_SCORE[squad.id].growthDifference += growthDifference

        StudentInSort.push({
          ...student,
          summaryAnswer,
          isValid,
          validAnswerCount,
          firstScore,
          lastScore,
          groupSatisfaction,
          growthDifference,
          activeAnswerForStudent,
        })
      })
    })

    const SquadInSort = [...(activeGroup?.Squad ?? [])]
      .sort((a: any, b: any) => {
        return SQUAD_SCORE[b.id].growthDifference - SQUAD_SCORE[a.id].growthDifference
      })

      .map((squad: any) => {
        const squadNumber = Grouping.getGroupIndexNumber({activeGroup, squad})

        const scores = SQUAD_SCORE[squad.id]
        return {id: squad.id, ...scores, ...squad, squadNumber}
      })

    StudentInSort = [...StudentInSort]
      .sort((a, b) => b.lastScore - a.lastScore)
      .sort((a, b) => b.growthDifference - a.growthDifference)

    return {SquadInSort, StudentInSort}
  })()

  const Trophy = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
        />
      </svg>
    )
  }

  const iconBtnClass = `icon-btn   min-w-[80px] font-bold border-primary-light border-2 `
  return (
    <>
      <div>
        <button
          className={`t-btn bg-primary-main rounded-full p-3   text-xl  font-bold hover:opacity-100`}
          onClick={() => {
            setshowAwards(true)
          }}
        >
          <TrophyIcon className={`w-12`} />
        </button>
      </div>

      <BasicModal
        {...{
          alertOnClose: false,
          open: showAwards,
          handleClose: () => {
            setshowAwards(false)
          },
        }}
      >
        <BasicTabs
          {...{
            id: 'Award',
            showAll: false,
            TabComponentArray:
              SquadInSort.length === 0
                ? [
                    {
                      label: '表彰結果',
                      component: <Alert color="red">グループが存在しません</Alert>,
                    },
                  ]
                : [
                    {
                      label: ' チーム表彰',
                      component: (
                        <>
                          {' '}
                          <section>
                            <C_Stack>
                              <section>
                                {SquadInSort?.map((squad, sq) => {
                                  const rank = sq + 1
                                  const {firstScore, lastScore, groupSatisfaction, growthDifference, validAnswerCount} = squad

                                  if (sq > 2) return
                                  return (
                                    <Rank {...{rank}} key={sq}>
                                      <div className={`col-stack mx-auto w-[300px] justify-around `}>
                                        <div className={`row-stack  mb-2   justify-center  text-4xl font-extrabold`}>
                                          <Trophy />
                                          <span>{squad.squadNumber}班 </span>
                                          <Trophy />
                                        </div>
                                        <div className={`row-stack   w-full flex-nowrap gap-4`}>
                                          {teacherId ? (
                                            <C_Stack className={`    `}>
                                              <div className={`w-20`}>初回:{firstScore}</div>
                                              <div className={`w-20`}>最終:{lastScore}</div>
                                              <div className={`w-20`}>満足:{groupSatisfaction}</div>
                                              <div className={`w-20`}>伸び:{growthDifference}</div>
                                              <div className={`w-20`}>回答数:{validAnswerCount}</div>
                                            </C_Stack>
                                          ) : (
                                            <></>
                                          )}
                                          <R_Stack className={`row-stack `}>
                                            {squad.Student.map((student, st) => {
                                              return (
                                                <div key={st}>
                                                  <div className={` min-w-[80px] text-base ${iconBtnClass}`}>{student.name}</div>
                                                </div>
                                              )
                                            })}
                                          </R_Stack>
                                        </div>
                                      </div>
                                    </Rank>
                                  )
                                })}
                              </section>
                            </C_Stack>
                          </section>
                        </>
                      ),
                    },

                    {
                      label: '個人表彰',
                      component: (
                        <>
                          <section>
                            <C_Stack>
                              <section>
                                {StudentInSort?.map((student: anyObject, sq) => {
                                  const {isValid, validAnswerCount} = student

                                  const {firstScore, lastScore, groupSatisfaction, growthDifference, summaryAnswer} = student

                                  const rank = sq + 1

                                  if (sq > 2) return

                                  return (
                                    <div key={sq}>
                                      <Rank {...{rank}}>
                                        <div className={`col-stack mx-auto w-[300px] justify-around font-bold`}>
                                          <div className={`row-stack  justify-center   text-3xl`}>
                                            <Trophy />
                                            <span>{student.name} </span>

                                            <Trophy />
                                          </div>

                                          <div className={` row-stack  justify-center  gap-2 `}>
                                            {teacherId && (
                                              <Fragment>
                                                <div>初回:{firstScore}</div>
                                                <div>最終:{lastScore}</div>
                                                <div>満足:{groupSatisfaction}</div>
                                                <div>伸び:{growthDifference}</div>
                                                <R_Stack>
                                                  回答数:
                                                  <div className={`w-10 text-center`}>
                                                    <Alert color={isValid ? 'blue' : 'red'} className={`text-sub-main`}>
                                                      {validAnswerCount}
                                                    </Alert>
                                                  </div>
                                                </R_Stack>
                                              </Fragment>
                                            )}
                                          </div>
                                        </div>
                                      </Rank>
                                    </div>
                                  )
                                })}
                              </section>
                            </C_Stack>
                          </section>
                        </>
                      ),
                    },
                    teacherId && {
                      label: '教員用明細データ',
                      component: (
                        <Alert>
                          こちらは教員のみ表示されています
                          <R_Stack className={`items-start`}>
                            <section className={`max-w-[1300px]`}>
                              <SimpleTable
                                {...{
                                  style: {width: 650},
                                  headerArr: ['順位', '班', '初回', '最終', '満足', '伸び', '回答数'],
                                  bodyArr: SquadInSort?.map((squad, sq) => {
                                    return [
                                      `${sq + 1} 位`,
                                      squad?.squadNumber,
                                      squad?.firstScore,
                                      squad?.lastScore,
                                      squad?.groupSatisfaction,
                                      squad?.growthDifference,
                                      squad?.validAnswerCount,
                                    ]
                                  }),
                                  options: {
                                    th: {
                                      widthArr: ['50px', '50px', '50px', '50px', '50px', '50px', '50px'],
                                    },
                                  },
                                }}
                              />
                            </section>
                            <section>
                              <SimpleTable
                                {...{
                                  style: {width: '100%'},
                                  headerArr: ['順位', '', '初回', '最終', '満足', '伸び', '回答数', '授業の感想'],

                                  bodyArr: StudentInSort?.map((student, sq) => {
                                    return [
                                      `${sq + 1} 位`,
                                      student?.name,
                                      student?.firstScore,
                                      student?.lastScore,
                                      student?.groupSatisfaction,
                                      student?.growthDifference,
                                      student?.validAnswerCount,
                                      <div className={`max-h-[200px]  overflow-auto text-start`}>
                                        {student?.summaryAnswer?.impression}
                                      </div>,
                                    ]
                                  }),
                                  options: {
                                    th: {
                                      widthArr: ['50px', '80px', '50px', '50px', '50px', '50px', '50px', '400px'],
                                    },
                                  },
                                }}
                              />
                            </section>
                          </R_Stack>
                        </Alert>
                      ),
                    },
                  ],
          }}
        />
      </BasicModal>
    </>
  )
}
