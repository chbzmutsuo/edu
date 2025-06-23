import {Grouping} from '@app/(apps)/Grouping/class/Grouping'
import {QueryBuilder} from '@app/(apps)/Grouping/class/QueryBuilder'
import {P_Query} from '@cm/class/PQuery'
import GameMainPage from '@app/(apps)/Grouping/components/Grouping/game/GameMainPage'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {initServerComopnent} from 'src/non-common/serverSideFunction'
import {Prisma} from '@prisma/client'
import {prismaDataExtractionQueryType} from '@components/DataLogic/TFs/Server/Conf'
import {searchByQuery} from '@lib/server-actions/common-server-actions/SerachByQuery/SerachByQuery'

export default async function Page(props) {
  const query = await props.searchParams
  const params = await props.params
  const dataModelName = 'game'

  const {take, page, skip} = P_Query.getPaginationPropsByQuery({query, tableId: ``, countPerPage: 20})
  const flexQuery = P_Query.createFlexQuery({
    take,
    page,
    skip,
    query,
    dataModelName,
  })
  const {session, scopes} = await initServerComopnent({query})

  const {include} =
    QueryBuilder.getInclude({
      session,
      query,
    })[dataModelName] ?? {}

  const {teacherId} = scopes.getGroupieScopes()

  const secretKey = params.secretKey

  const prismaDataExtractionQuery: prismaDataExtractionQueryType = {
    ...flexQuery,
    where: {AND: [...flexQuery.AND], secretKey},
    include: !include ? undefined : {...include},
  }

  const prismaData = await searchByQuery({modelName: dataModelName, prismaDataExtractionQuery})

  const game = prismaData?.records?.[0]

  if (!game) {
    return <div>{secretKey}: このプロジェクトは存在しません</div>
  }
  const players = game?.GameStudent?.map(mid => {
    return {...mid.Student}
  }).flat()

  if (teacherId && game.QuestionPrompt?.length === 0) {
    const resetGameStatusPayload: Prisma.GameUpdateArgs = {
      where: {id: game.id},
      data: {
        activeQuestionPromptId: null,
        QuestionPrompt: {
          deleteMany: {
            id: {
              in: game.QuestionPrompt.map(qp => qp.id),
            },
          },
        },
      },
    }
    const {result} = await doStandardPrisma('game', 'update', resetGameStatusPayload)

    await Grouping.createNewPrompt({
      newStatus: `アンケート実施`,
      Game: game,
      players,
      dev: query.g_dev === 'ON',
    })
  }

  return <GameMainPage {...{game, secretKey, prismaDataExtractionQuery}} />
}
