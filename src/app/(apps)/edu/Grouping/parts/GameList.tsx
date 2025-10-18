'use client'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import {HREF} from '@cm/lib/methods/urls'
import {useState} from 'react'
import BasicModal from '@cm/components/utils/modal/BasicModal'

import GameCreateForm from '@app/(apps)/edu/Grouping/parts/GameCreateForm'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {Center, C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'
import {Button} from '@cm/components/styles/common-components/Button'
import {shorten} from '@cm/lib/methods/common'
import {Paper} from '@cm/components/styles/common-components/paper'
import MyPopover from '@cm/components/utils/popover/MyPopover'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'
import {getColorStyles} from '@cm/lib/methods/colors'
import AutoGridContainer from '@cm/components/utils/AutoGridContainer'

export const GameList = ({myGame}) => {
  const {query, session, router, toggleLoad} = useGlobal()
  const [newGameFormData, setnewGameFormData] = useState<any>(null)

  const itemWidth = 320
  const wrapperWidth = itemWidth * 4

  return (
    <C_Stack style={{maxWidth: wrapperWidth, margin: `auto`}} className={`mx-auto max-w-[1600px]   `}>
      <section>
        <BasicModal {...{open: newGameFormData !== null, handleClose: () => setnewGameFormData(null)}}>
          {<GameCreateForm {...{newGameFormData, setnewGameFormData}} />}
        </BasicModal>
      </section>
      <section>
        <Button color="blue" onClick={() => setnewGameFormData({id: 0})}>
          新規作成
        </Button>
      </section>
      <hr />
      <C_Stack className={` items-center`}>
        <AutoGridContainer {...{className: ` mx-auto gap-8 w-fit `, maxCols: {md: 2, lg: 3, xl: 4}}}>
          {myGame.map((game, index) => {
            const {
              name,
              date,
              secretKey,
              absentStudentIds,
              schoolId,
              teacherId,
              roomId,
              subjectNameMasterId,
              status,
              activeGroupId,
              activeQuestionPromptId,
              nthTime,
              randomTargetStudentIds,
              task,
              SubjectNameMaster,
              Teacher,
              Group,
              QuestionPrompt,
              GameStudent,
            } = game

            const gamePath = HREF(`/edu/Grouping/game/main/${secretKey}`, {as: 'teacher'}, query)
            const editPath = HREF(`/edu/Grouping/game/${game.id}`, {}, query)

            const copy = () => setnewGameFormData({id: 0, ...game, GameStudent})
            const edit = () => router.push(editPath)
            const start = () => router.push(gamePath)

            const deleteGame = () => {
              if (confirm(`本当に削除しますか？`)) {
                toggleLoad(async () => {
                  await doStandardPrisma(`game`, `delete`, {where: {id: game.id}})
                })
              }
            }

            return (
              <Paper className={`rounded-md`} key={index} style={{width: 320, padding: 10}}>
                <C_Stack>
                  <div className={`h-[100px] bg-gray-500`}>
                    <Center style={{...getColorStyles(SubjectNameMaster.color), height: `100%`}}>{SubjectNameMaster.name}</Center>
                  </div>
                  <strong>{name}</strong>

                  <R_Stack className={`  justify-between`}>
                    <R_Stack>
                      <div className={`w-fit`}>
                        <IconBtn color={SubjectNameMaster?.color ?? ''}>{SubjectNameMaster?.name}</IconBtn>
                      </div>
                      <div>第{nthTime}時</div>
                      <div>{GameStudent.length}名</div>
                    </R_Stack>
                    <small>{formatDate(date, 'YYYY年MM月DD日(ddd)')}</small>
                  </R_Stack>
                  <MyPopover {...{button: <p>{shorten(task, 50)}</p>}}>
                    <Paper className={`max-w-[400px]`}>{task}</Paper>
                  </MyPopover>

                  <R_Stack className={` justify-end text-sm `}>
                    <Button color={`green`} onClick={start}>
                      開始
                    </Button>

                    <Button color={`blue`} onClick={edit}>
                      編集
                    </Button>

                    <Button color={`sub`} onClick={copy}>
                      コピー
                    </Button>
                    <Button color={`red`} onClick={deleteGame}>
                      削除
                    </Button>
                  </R_Stack>
                </C_Stack>
              </Paper>
            )
          })}
        </AutoGridContainer>
      </C_Stack>
    </C_Stack>
  )
}
