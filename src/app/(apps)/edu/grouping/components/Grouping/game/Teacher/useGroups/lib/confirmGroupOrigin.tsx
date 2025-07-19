import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/client'
import {toast} from 'react-toastify'

export const confirmGroupOrigin = async ({initialGroupName, groups, toggleLoad, selectedPromptForGroup, Game, setgroups}) => {
  if (!confirm(`【${initialGroupName}】で新規グループを適応しますか？`)) {
    return
  }
  await toggleLoad(async () => {
    const activeGroups = groups.filter(g => g.length > 0) //所属人数が１以上のグループ

    const gameUpdatePayload: Prisma.GameUpdateArgs = {
      where: {id: Game.id},
      include: {Group: {orderBy: {createdAt: 'desc'}}},
      data: {
        Group: {
          create: {
            name: initialGroupName,
            isSaved: false,

            Squad: {
              create: activeGroups.map((squad, idx) => {
                const Student = squad.map(answer => answer.Student)

                return {
                  name: `${idx + 1}班`,
                  StudentRole: {
                    create: Student.map(s => {
                      const newRole = Game.LearningRoleMasterOnGame.find(role => role.name === s.roleInGroup)

                      return {
                        LearningRoleMasterOnGame: {connect: {id: newRole.id}},
                        Student: {connect: {id: s.id}},
                      }
                    }),
                  },
                  Student: {
                    connect: [
                      ...Student.map(s => {
                        return {id: s.id}
                      }),
                    ],
                  },
                }
              }),
            }, //小グループを入れる
            questionPromptId: selectedPromptForGroup?.id, //promptの子要素として追加する
          },
        },
      },
    }

    const {result: UpdatedGame} = await doStandardPrisma('game', 'update', {
      include: gameUpdatePayload.include,
      where: gameUpdatePayload.where,
      data: {...gameUpdatePayload.data},
    })

    const latestGroup = UpdatedGame?.Group?.[0]

    const res = await doStandardPrisma('game', 'update', {where: {id: Game.id}, data: {activeGroupId: latestGroup.id}})

    toast.success(`グループを作成しました。`)
    setgroups(null)
  })
}
