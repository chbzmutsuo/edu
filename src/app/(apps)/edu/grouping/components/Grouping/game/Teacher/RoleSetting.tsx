import React from 'react'

import ChildCreator from '@components/DataLogic/RTs/ChildCreator/ChildCreator'
import {ColBuilder} from '@app/(apps)/edu/grouping/class/ColBuilder'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {ClipboardDocumentIcon} from '@heroicons/react/20/solid'

import {Grouping} from '@app/(apps)/edu/grouping/class/Grouping'

import {CircledIcon} from '@components/styles/common-components/IconBtn'
import {useGlobalPropType} from '@hooks/globalHooks/useGlobal'

export const RoleSetting = ({Game, useGlobalProps}) => {
  const {toggleLoad, accessScopes} = useGlobalProps as useGlobalPropType
  const {teacherId} = accessScopes().getGroupieScopes()

  const transferDataFromLearningRoleMaster = async () => {
    if (!confirm(`役割マスタから一括反映しますか？`)) {
      return
    }
    toggleLoad(async () => {
      const roles = Object.keys(Grouping.ROLES).map(role => {
        const {color, maxCount} = Grouping.ROLES[role]
        return {name: role, color, maxCount}
      })

      const result = await Promise.all(
        roles.map(async d => {
          const {name, color, maxCount} = d

          return await doStandardPrisma(`learningRoleMasterOnGame`, `create`, {
            data: {
              name,
              color,
              maxCount,
              Game: {connect: {id: Game.id}},
            },
          })
        })
      )
    })
  }

  return (
    <ChildCreator
      {...{
        ParentData: Game,
        models: {parent: `game`, children: `learningRoleMasterOnGame`},
        columns: ColBuilder.learningRoleMasterOnGame({useGlobalProps}),
        useGlobalProps,
        additional: {
          payload: {
            gameId: Game.id,
          },
        },
        myTable: {
          style: {width: 270},
          header: true,
          drag: true,
          customActions: () => {
            return (
              <>
                {Game.LearningRoleMasterOnGame.length === 0 && (
                  <CircledIcon onClick={transferDataFromLearningRoleMaster}>
                    <ClipboardDocumentIcon />
                  </CircledIcon>
                )}
              </>
            )
          },
        },
      }}
    />
  )
}
