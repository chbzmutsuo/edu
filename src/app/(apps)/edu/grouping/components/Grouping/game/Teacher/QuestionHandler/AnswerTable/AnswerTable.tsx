import React from 'react'

import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {toast} from 'react-toastify'
import {GameContextType} from '@app/(apps)/edu/grouping/components/Grouping/game/GameMainPage'
import {Thead} from '@app/(apps)/edu/grouping/components/Grouping/game/Teacher/QuestionHandler/AnswerTable/Thead'
import {Tbody} from '@app/(apps)/edu/grouping/components/Grouping/game/Teacher/QuestionHandler/AnswerTable/Tbody'
const AnswerTable = ({handleCreateGroup, GameCtxValue}) => {
  const {Game, players, GAME_CLASS, activePrompt, toggleLoad} = GameCtxValue as GameContextType

  const handleDeletePrompt = async prompt => {
    if (confirm('アンケートを削除しますか？')) {
      if (confirm('本当に削除してもよろしいですか？')) {
        await toggleLoad(async () => {
          await doStandardPrisma(`questionPrompt`, 'delete', {where: {id: prompt.id}})
        })
      }
    }
  }

  // 出欠情報情報更新関数;
  const toggleAttendance = async (e, studentId) => {
    await toggleLoad(async () => {
      const isAbsent = Boolean(e.target.checked) === false
      let array = Game.absentStudentIds
      if (isAbsent) {
        array.push(studentId)
      } else {
        array = array.filter(id => id !== studentId)
      }

      await doStandardPrisma('game', 'update', {where: {id: Game.id}, data: {absentStudentIds: array}})
    })
  }

  const deleteAnswer = async ({answer}) => {
    const CurrentPrompt = Game.QuestionPrompt.find(p => p.id === answer.questionPromptId)
    const isPromptActive = CurrentPrompt.active
    const isDeletable = isPromptActive === true
    if (!isDeletable) {
      alert('締め切られているアンケートの回答は削除できません。')
      return
    }
    const msg = `回答をやり直しますか？`
    if (confirm(msg)) {
      toggleLoad(async () => {
        await doStandardPrisma('answer', 'update', {
          where: {id: answer.id},
          data: {
            curiocity1: null,
            curiocity2: null,
            curiocity3: null,
            curiocity4: null,
            curiocity5: null,
            efficacy1: null,
            efficacy2: null,
            efficacy3: null,
            efficacy4: null,
            efficacy5: null,
            impression: null,
            lessonSatisfaction: null,
            lessonImpression: null,
          },
        })
        toast.warning(`回答を削除しました。再度入力できます。`)
      })
    }
  }

  const isSummary = activePrompt?.asSummary
  const btnClass = `onHover  rounded-full p-0.5 w-5  `
  return (
    <div className={` w-fit max-w-[300px] overflow-auto `}>
      <div className={`sticky-table-wrapper   max-h-[700px] border-2 border-gray-400 shadow-sm `}>
        <table className={`table-fixed`}>
          <Thead {...{Game, activePrompt, handleDeletePrompt, isSummary, btnClass}} />
          <Tbody {...{GameCtxValue, players, toggleAttendance, deleteAnswer}} />
        </table>
      </div>
    </div>
  )
}
export default AnswerTable
