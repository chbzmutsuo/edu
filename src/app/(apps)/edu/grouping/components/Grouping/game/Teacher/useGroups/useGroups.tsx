import React, {useMemo} from 'react'
import {useState} from 'react'

import {confirmGroupOrigin} from '@app/(apps)/edu/Grouping/components/Grouping/game/Teacher/useGroups/lib/confirmGroupOrigin'
import {GroupConfirmationModalOrigin} from '@app/(apps)/edu/Grouping/components/Grouping/game/Teacher/useGroups/lib/GroupConfirmationModalOrigin'
import {Grouping} from '@app/(apps)/edu/class/Grouping'
import {jotaiStudentGroups, useJotai} from '@hooks/useJotai'
export type AnswerType = {
  id: string
  studentId: string
  curiocity: number
  efficacy: number
  name: string
  absent?: boolean
  Student: any
}

export type useGroupReturnObjType = ReturnType<typeof useGroups>

export const getGroupCountDefault = players => Math.floor(players?.length / 4)
export const getGroupMemberCountDefault = players => 4

const useGroups = ({GameCtxValue, groupSettingFormHook}) => {
  const {Game, GAME_CLASS, toggleLoad} = GameCtxValue
  const [groups, setgroups] = useJotai(jotaiStudentGroups)

  const [selectedPromptForGroup, setselectedPromptForGroup] = useState<any>(null)
  const {count, groupCreationMode, criteria, genderConfig} = groupSettingFormHook.groupConfigFormValues

  const [initialGroupName, setinitialGroupName] = useState('新しいグループ')

  const handleCreateGroup = ({groupConfig, prompt}) => {
    const {count, groupCreationMode, criteria, genderConfig} = groupConfig
    const {Game, players} = GameCtxValue
    const absentStudentAnswers: any[] = []

    const Answer = players
      .map(player => {
        const data = Game.Answer.find(answer => answer.studentId === player.id)
        const {curiocity, efficacy} = Grouping.getCuriocityAndEfficacy(data)
        return {...data, curiocity, efficacy, Student: player, name: player.name, gender: player.gender}
      })
      .filter(data => {
        if (GAME_CLASS.isThisStudentAttending(data?.studentId)) {
          return true
        } else {
          absentStudentAnswers.push({...data, absent: true})
          return false
        }
      })

    const newGroups = (() => {
      const groups: any[] = []

      // 初期ランダムシャッフル
      const data = [...Answer]
      data.sort(() => Math.random() - 0.5)

      if (criteria === 'efficacy') {
        data.sort((a, b) => b.efficacy - a.efficacy)
      } else if (criteria === 'curiocity') {
        data.sort((a, b) => b.curiocity - a.curiocity)
      }

      // グループ数とメンバー数の計算
      const {groupCount, groupMemberCount} = getCounts({groupCreationMode, count, players})

      // 理想的なグループサイズの計算
      const totalPlayers = data.length
      const minGroupSize = Math.floor(totalPlayers / groupCount)
      const extraPlayers = totalPlayers % groupCount

      // グループの初期化
      for (let i = 0; i < groupCount; i++) {
        groups.push([])
      }

      let groupIndex = 0
      while (data.length > 0) {
        const currentData = data.shift()

        // 性別ごとの分け方（設定がある場合）
        if (genderConfig === 'separate') {
          const targetGroupIndex = groups.findIndex(
            group =>
              group.length < minGroupSize + (groupIndex < extraPlayers ? 1 : 0) &&
              (group.length === 0 || group[0].gender === currentData.gender)
          )

          if (targetGroupIndex !== -1) {
            groups[targetGroupIndex].push(currentData)
          } else {
            data.push(currentData)
          }
        } else {
          // 標準的なグループ割り当て
          if (
            groups[groupIndex].length < minGroupSize ||
            (groups[groupIndex].length < minGroupSize + 1 && groupIndex < extraPlayers)
          ) {
            groups[groupIndex].push(currentData)
          } else {
            groupIndex = (groupIndex + 1) % groupCount
            groups[groupIndex].push(currentData)
          }
        }

        groupIndex = (groupIndex + 1) % groupCount
      }

      return groups
    })()

    const allGroupsIncludingAbsents = [...newGroups, [...absentStudentAnswers]]

    const groupsWithRole = GAME_CLASS.getGroupsWithRoles(allGroupsIncludingAbsents).groupWithRoles

    setgroups(groupsWithRole)
    return groupsWithRole
  }

  const confirmGroup = () => confirmGroupOrigin({initialGroupName, groups, toggleLoad, selectedPromptForGroup, Game, setgroups})

  const GroupConfirmationModal = useMemo(() => {
    return (
      <GroupConfirmationModalOrigin
        {...{groups, setgroups, initialGroupName, setinitialGroupName, confirmGroup, GameCtxValue, GAME_CLASS}}
      />
    )
  }, [groups, initialGroupName])

  return {
    groups,
    initialGroupName,
    setinitialGroupName,
    groupCreationMode,
    handleCreateGroup,
    confirmGroup,
    setselectedPromptForGroup,
    setgroups,
    GroupConfirmationModal,
    groupConfigMaster,
  }
}
export default useGroups

export const groupConfigMaster = {
  groupCreationMode: {
    options: [
      {id: `groupMemberCount`, value: `人数`},
      {id: `groupCount`, value: `班数`},
    ],
  },
  groupType: {
    options: [
      {id: `efficacy`, value: `学び合い`},
      {id: `curiocity`, value: `深めあい`},
      {id: `random`, value: `ランダム`},
    ],
  },
  gender: {
    options: [
      {id: `mix`, value: `男女混合`},
      {id: `separate`, value: `男女別`},
    ],
  },
}

const getCounts = ({groupCreationMode, count, players}) => {
  const groupCount = groupCreationMode === `groupCount` ? count : Math.ceil(players?.length / count)
  const groupMemberCount = groupCreationMode === `groupMemberCount` ? count : Math.floor(players?.length / count)
  return {groupCount, groupMemberCount}
}
