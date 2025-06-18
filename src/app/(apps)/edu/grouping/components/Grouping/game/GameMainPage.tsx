// http://localhost:3000/Grouping/game/main/297393?as=teacher&g_schoolId=2&g_teacherId=3
'use client'
import {useEffect, useState} from 'react'

import Loader from '@cm/components/utils/loader/Loader'
import {GameClass, Grouping} from '@app/(apps)/edu/grouping/class/Grouping'
import {basePath} from '@cm/lib/methods/common'
import TeacherDisplay from '@app/(apps)/edu/grouping/components/Grouping/game/Teacher/TeacherDisplay'

import StudentDisplay from '@app/(apps)/edu/grouping/components/Grouping/game/Student/StudentDIsplay'

import PlayerSelector from '@app/(apps)/edu/grouping/components/Grouping/game/PlayerSelector'

import useInterval from '@cm/hooks/useInterval'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {Button} from '@components/styles/common-components/Button'
import {C_Stack} from '@components/styles/common-components/common-components'
export type GameContextType = {
  activeGroupsWithRoles
  isTeacher: boolean
  randomSamplingInfo
  teacherId
  secretKey
  url
  Game
  requiredAnswerCount
  player
  players
  activePrompt
  mustSummarize
  isNewPromptAvailabel
  hasAnsweredToPrompt
  activeGroup
  GAME_CLASS
  toggleLoad
  useGlobalProps
  playerInfo

  chartPageSelecedData
  setchartPageSelecedData
}
// export const GameContext = createContext<anyObject>({})

export default function GameMainPage({game, secretKey, prismaDataExtractionQuery}) {
  const [chartPageSelecedData, setchartPageSelecedData] = useState(0)
  const useGlobalProps = useGlobal()
  const {toggleLoad, session, accessScopes, router, query} = useGlobalProps
  const scopes = accessScopes()
  const {teacherId} = scopes.getGroupieScopes()

  const [Game, setGame] = useState(game)

  /**プロジェクト基本情報 */

  const GAME_CLASS = new GameClass(Game)
  const players = GAME_CLASS?.getStudent()

  let player
  if (query?.as === 'student') {
    player = players?.find(s => s.id === Number(query.sid))
  } else if (query?.as === 'teacher') {
    player = session
  }

  const randomSamplingInfo = (() => {
    const [randomSamplingState, setrandomSamplingState] = useState<any>({
      count: 5,
      minute: 5,
    })

    const targetStudentIds = Game?.randomTargetStudentIds
    const randomSamplingIsEffective = targetStudentIds?.length > 0

    const [showTargetPlayers, setshowTargetPlayers] = useState(randomSamplingIsEffective)
    const intervalIsReady = randomSamplingState?.minute && randomSamplingState?.count && randomSamplingIsEffective
    const interval = intervalIsReady ? randomSamplingState?.minute * 1000 * 60 : 99999999999

    useInterval(async () => {
      if (intervalIsReady && randomSamplingState?.count > 0) {
        toggleLoad(async () => {
          const result = await Grouping.setRandomTargetStudentIds({
            Game,
            randomSamplingState,
            setshowTargetPlayers,
          })
        })
      }
    }, interval)
    return {
      showTargetPlayers,
      setshowTargetPlayers,
      randomSamplingState,
      setrandomSamplingState,
      randomSamplingIsEffective,
      targetStudentIds,
    }
  })()

  const requiredAnswerCount = 1
  const url = `${basePath}/Grouping/game/main/${secretKey}?as=student`
  const activePrompt = GAME_CLASS.getCurrentActivePrompt()

  const activeGroup = GAME_CLASS.getActiveGroup()
  const activeGroupsWithRoles = GAME_CLASS.getGroupsWithRoles(activeGroup?.Squad)?.groupWithRoles
  const mustSummarize = GAME_CLASS.mustSummarize()

  const isNewPromptAvailabel = activePrompt === undefined

  const ActivePromptAnswers = Game.Answer.filter(ans => ans.questionPromptId === activePrompt?.id)

  const hasAnsweredToPrompt = ActivePromptAnswers?.find(data => {
    return data.studentId === player?.id && data.curiocity1 !== null
  })

  const {playerInfo} = (() => {
    const promptedQuestionRemain = ActivePromptAnswers?.find(data => {
      return data.studentId === player?.id && data.curiocity1 === null
    })
    const randomQuestionRemain = Game.Answer.findLast(data => {
      return data.studentId === player?.id && data.curiocity1 === null && !data.questionPromptId
    })

    const questionToAnswer = promptedQuestionRemain ?? randomQuestionRemain

    const playerInfo = {
      promptedQuestionRemain,
      randomQuestionRemain,
      questionToAnswer,
    }
    return {playerInfo}
  })()

  // useInterval(
  //   () => {
  //     router.refresh()
  //   },
  //   isDev ? 5 * 1000 : 30 * 1000
  // )

  useEffect(() => {
    if (Game.QuestionPrompt.length === 0) {
      router.refresh()
    }
  }, [Game.QuestionPrompt.length])

  const isTeacher = !scopes.login || !session.scopes.getGroupieScopes().teacherId
  const isStudent = query?.as === 'student'

  const GameCtxValue: GameContextType = {
    activeGroupsWithRoles,
    Game,
    randomSamplingInfo,
    teacherId,
    secretKey,
    url,
    requiredAnswerCount,
    player,
    players,
    activePrompt,
    mustSummarize,
    isNewPromptAvailabel,
    hasAnsweredToPrompt,
    activeGroup,
    GAME_CLASS,
    toggleLoad,
    useGlobalProps,
    playerInfo,
    chartPageSelecedData,
    setchartPageSelecedData,
    isTeacher,
  }

  return (
    <div>
      {Game ? (
        <section>
          <div className={`m-2  text-center`}></div>
          {!player ? (
            <div>
              <PlayerSelector {...{GameCtxValue}} />
            </div>
          ) : (
            <div>
              {/* 教員用画面 */}
              {query?.as === 'teacher' && player && <div>{isTeacher && <TeacherDisplay {...{GameCtxValue, toggleLoad}} />}</div>}

              {/* 児童・生徒用画面 */}
              {query?.as === 'student' && player && (
                <C_Stack className={`items-center`}>
                  <Button color={`red`} className={`animate-pulse`} onClick={router.refresh}>
                    更新する
                  </Button>
                  <StudentDisplay {...{GameCtxValue}} />
                </C_Stack>
              )}
            </div>
          )}
        </section>
      ) : (
        <Loader />
      )}
    </div>
  )
}
