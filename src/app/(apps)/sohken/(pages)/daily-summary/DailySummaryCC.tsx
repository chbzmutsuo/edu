'use client'

import {GenbaCl} from '@app/(apps)/sohken/class/GenbaCl'
import {GoogleDocs_batchUpdate} from '@app/api/google/actions/docsAPI'
import {DocsRequests, textInsertRequest} from '@app/api/google/actions/DocsRequests'

import {GoogleDrive_GetFilesInFolder} from '@app/api/google/actions/driveAPI'
import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import {Button} from '@components/styles/common-components/Button'
import {C_Stack, Circle, Padding, R_Stack} from '@components/styles/common-components/common-components'

import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'

import {MarkDownDisplay} from '@components/utils/texts/MarkdownDisplay'
import useGlobal from '@hooks/globalHooks/useGlobal'

import {useRef} from 'react'
import {useReactToPrint} from 'react-to-print'
import {GetNinkuList} from 'src/non-common/(chains)/getGenbaScheduleStatus/getNinkuList'

export const DailySummaryCC = ({genbaDayList, allShiftBetweenDays, records}) => {
  const {toggleLoad} = useGlobal()
  const contentRef = useRef<HTMLDivElement>(null)
  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle: '@page { size: portrait; }',
    suppressErrors: true,
  })

  const {query} = useGlobal()

  const parentFolderUrl = 'https://drive.google.com/drive/folders/124brhJc2jL-cDQyexzcZm2Hu50_UKpDa'

  const data = genbaDayList
    .map((GenbaDay, i) => {
      const num = i + 1

      const allShift = GenbaDay.GenbaDayShift ?? []
      const GenbaDayTaskMidTable = GenbaDay.GenbaDayTaskMidTable ?? []
      const GenbaDayShift = GenbaDay.GenbaDayShift ?? []

      const genbaDaySoukenCar = GenbaDay.GenbaDaySoukenCar ?? []
      const Genba = GenbaDay.Genba
      const {floorThisPlay} = new GenbaCl(GenbaDay.Genba)
      const defaultStartTime =
        formatDate(GenbaDay.date, 'ddd') === '土' && Genba?.defaultStartTime === '早出' ? '通常' : Genba?.defaultStartTime

      const forceNormalCon1 = allShift.some(s => {
        return !s.from
      })
      const forceNormal = forceNormalCon1

      const subTasksOnGenbaTask = GenbaDayTaskMidTable.map(item => item.GenbaTask.subTask)
      const subTasksOnGenbaDay = GenbaDay.subTask
      const subTasks = [...subTasksOnGenbaTask, subTasksOnGenbaDay]

      const remarksOnGenbaTask = GenbaDayTaskMidTable.map(item => item.GenbaTask.remarks)
      const remarksOnGenbaDay = GenbaDay.remarks
      const remarks = [...remarksOnGenbaTask, remarksOnGenbaDay]

      const {result} = GetNinkuList({GenbaDay, theDay: GenbaDay.date, GenbaDayTaskMidTable})

      const requests: textInsertRequest[] = [
        //
        {text: `(${num})`},
        {
          text: !forceNormal ? `---` : defaultStartTime,
          color: forceNormal ? (defaultStartTime === '通常' ? '#0059ff' : '#f000e4') : undefined,
        },
        {text: Genba?.PrefCity?.city},
        {text: Genba?.name},
        {text: `(${floorThisPlay})`},
        {text: Genba?.construction},
        {text: remarks.join(`, `)},

        // タスク
        GenbaDayTaskMidTable.length ? {text: `\n`} : undefined,
        ...GenbaDayTaskMidTable.map((d, i) => {
          const {name, from, to, requiredNinku, color} = d.GenbaTask

          return {
            text: [
              //
              name,
              formatDate(from, 'M/D') + '~' + formatDate(to, 'M/D'),
              `<${requiredNinku}>-${result[name ?? '']}>`,
            ].join(` `),
            color,
          }
        }),

        // シフト
        GenbaDayShift.length ? {text: `\n`} : undefined,
        ...GenbaDayShift.map((shift, i) => {
          const {User, from, to, important, directGo, directReturn, shokucho, userId} = shift

          const shiftsOnOtherGembaOnSameDate = allShiftBetweenDays
            .filter(shift => {
              return (
                shift.userId === User.id &&
                Days.validate.isSameDate(shift.GenbaDay.date, GenbaDay.date) &&
                shift.GenbaDay.genbaId !== GenbaDay.genbaId &&
                shift.from
              )
            })
            .sort((a, b) => {
              const aTime = new Date(formatDate(a.GenbaDay.date) + ' ' + a.from)
              const bTime = new Date(formatDate(b.GenbaDay.date) + ' ' + b.from)
              return aTime.getTime() - bTime.getTime()
            })

          const cardDate = new Date(formatDate(GenbaDay.date) + ' ' + to)
          const nextShift =
            to &&
            shiftsOnOtherGembaOnSameDate.find(shift => {
              const date2 = new Date(formatDate(shift.GenbaDay.date) + ' ' + shift.from)

              return cardDate <= date2 && shift.from
            })

          const nextShiftIndex = nextShift
            ? records?.findIndex(genbaday => {
                return genbaday.id === nextShift?.genbaDayId
              })
            : null

          const nextShiftDisplay =
            nextShift && nextShiftIndex
              ? {
                  text: [
                    //
                    '➡︎',
                    nextShiftIndex + 1,
                    nextShift?.from,
                    nextShift?.to,
                  ].join(` `),
                }
              : null

          const currentShiftDisplay = {
            text: [
              //
              directGo ? '直行) ' : '',
              directReturn ? '直帰) ' : '',
              User?.name + ': ',
              from ? from : '',
              from || to ? '~' : '',
              to ? to : '',
            ]
              .filter(Boolean)
              .join(` `),
            color: important ? 'orange' : shokucho ? 'green' : 'white',
          }

          return {
            text: [
              //
              currentShiftDisplay.text,
              nextShiftDisplay?.text,
            ].join(` `),
            color: important ? 'orange' : shokucho ? 'green' : 'white',
          }
        }),

        //連絡事項
        subTasks.filter(Boolean).length ? {text: `\n`} : undefined,
        {
          text: subTasks
            .filter(Boolean)
            .map(data => data.replace(/\n/g, ' '))
            .join(``),
        },
        {text: `\n\n`},
      ]

      return requests
    })
    .flat()
    .filter(Boolean)
    .map(data => {
      const text = String(data.text).includes('\n') ? String(data.text) : `${String(data.text)} `
      return {...data, text}
    })

  return (
    <Padding>
      <div className={`p-2`}>
        <Button
          color="blue"
          onClick={async () => {
            toggleLoad(async () => {
              const getFilesRes = await GoogleDrive_GetFilesInFolder({
                folderId: parentFolderUrl,
                q: 'name = "日報雛形"',
              })

              const templateDoc = getFilesRes.files[0]

              const res = await GoogleDocs_batchUpdate({
                docId: templateDoc.id ?? '',
                // clearContent: true,
                requests: DocsRequests.setIndex(data),
              })
              // const newDoc = await GoogleDrive_CopyFile({
              //   fileId: templateDoc.id ?? '',
              //   newName: [todayStr, '日報'].join('_'),
              //   parentFolderId: parentFolderUrl,
              // })

              // reactToPrintFn()
            })
          }}
        >
          印刷
        </Button>
      </div>

      <section ref={contentRef} className={`  mx-auto border p-2 rounded-lg`}>
        <C_Stack className={`gap-4 `}>
          <NewDateSwitcher />
          {genbaDayList.map((GenbaDay, i) => {
            const num = i + 1

            const allShift = GenbaDay.GenbaDayShift ?? []
            const GenbaDayTaskMidTable = GenbaDay.GenbaDayTaskMidTable ?? []
            const GenbaDayShift = GenbaDay.GenbaDayShift ?? []
            const genbaDaySoukenCar = GenbaDay.GenbaDaySoukenCar ?? []
            const Genba = GenbaDay.Genba
            const {floorThisPlay} = new GenbaCl(GenbaDay.Genba)
            const defaultStartTime =
              formatDate(GenbaDay.date, 'ddd') === '土' && Genba?.defaultStartTime === '早出' ? '通常' : Genba?.defaultStartTime

            const forceNormalCon1 = allShift.some(s => {
              return !s.from
            })
            const forceNormal = forceNormalCon1

            const subTasksOnGenbaTask = GenbaDayTaskMidTable.map(item => item.GenbaTask.subTask)
            const subTasksOnGenbaDay = GenbaDay.subTask
            const subTasks = [...subTasksOnGenbaTask, subTasksOnGenbaDay]

            const remarksOnGenbaTask = GenbaDayTaskMidTable.map(item => item.GenbaTask.remarks)
            const remarksOnGenbaDay = GenbaDay.remarks
            const remarks = [...remarksOnGenbaTask, remarksOnGenbaDay]

            const {result} = GetNinkuList({GenbaDay, theDay: GenbaDay.date, GenbaDayTaskMidTable})

            return (
              <C_Stack key={i} className={`gap-0 border-t pt-2 leading-5 `}>
                <R_Stack>
                  <Circle className={`leading-inherit`}>{num}</Circle>

                  <div>
                    {!forceNormal ? (
                      <>---</>
                    ) : (
                      <span className={' font-bold ' + (defaultStartTime === '通常' ? 'text-blue-600' : ' text-pink-600')}>
                        {defaultStartTime}
                        {/* {displayNormal ? '通常' : defaultStartTime} */}
                      </span>
                    )}
                  </div>

                  <div>{Genba?.PrefCity?.city}</div>
                  <div>
                    <span>{Genba?.name}</span>
                    <span>{`(${floorThisPlay})`}</span>
                  </div>

                  <div>{Genba?.construction}</div>

                  <div>
                    <MarkDownDisplay>{remarks.join(`\n`)}</MarkDownDisplay>
                  </div>
                </R_Stack>
                <R_Stack>
                  {GenbaDayTaskMidTable.map((d, i) => {
                    const {name, from, to, requiredNinku, color} = d.GenbaTask

                    return (
                      <R_Stack key={i}>
                        <R_Stack className={` gap-0.5`}>
                          <C_Stack className={`items-center gap-0`}>
                            <span>{name}</span>
                          </C_Stack>
                          <div>
                            <small>{formatDate(from, 'M/D')}~</small>
                            <small>{formatDate(to, 'M/D')}</small>
                          </div>
                        </R_Stack>
                        <R_Stack className={` gap-0`}>
                          <span>{`<`}</span>
                          <span>#</span>
                          <strong>{requiredNinku}</strong>
                          <span>-</span>
                          <span>{result[name ?? '']}</span>

                          <span>{`>`}</span>
                        </R_Stack>
                      </R_Stack>
                    )
                  })}
                </R_Stack>
                <R_Stack>
                  {GenbaDayShift.map((shift, i) => {
                    const {User, from, to, important, directGo, directReturn, shokucho, userId} = shift

                    const shiftsOnOtherGembaOnSameDate = allShiftBetweenDays
                      .filter(shift => {
                        return (
                          shift.userId === User.id &&
                          Days.validate.isSameDate(shift.GenbaDay.date, GenbaDay.date) &&
                          shift.GenbaDay.genbaId !== GenbaDay.genbaId &&
                          shift.from
                        )
                      })
                      .sort((a, b) => {
                        const aTime = new Date(formatDate(a.GenbaDay.date) + ' ' + a.from)
                        const bTime = new Date(formatDate(b.GenbaDay.date) + ' ' + b.from)
                        return aTime.getTime() - bTime.getTime()
                      })

                    const cardDate = new Date(formatDate(GenbaDay.date) + ' ' + to)
                    const nextShift =
                      to &&
                      shiftsOnOtherGembaOnSameDate.find(shift => {
                        const date2 = new Date(formatDate(shift.GenbaDay.date) + ' ' + shift.from)

                        return cardDate <= date2 && shift.from
                      })

                    const nextShiftIndex = nextShift
                      ? records?.findIndex(genbaday => {
                          return genbaday.id === nextShift?.genbaDayId
                        })
                      : null

                    const nextShiftDisplay =
                      nextShift && nextShiftIndex ? (
                        <R_Stack className={`gap-[1px]`}>
                          <span>➡︎</span>
                          <Circle>{nextShiftIndex + 1}</Circle>
                          {nextShift?.from && (
                            <>
                              <span>{nextShift?.from}</span>
                            </>
                          )}

                          {(nextShift?.from || nextShift?.to) && <small>~</small>}

                          {nextShift?.to && (
                            <>
                              <span>{nextShift?.to}</span>
                            </>
                          )}
                        </R_Stack>
                      ) : null

                    const currentShiftDisplay = (
                      <R_Stack className={`gap-[1px]`}>
                        {directGo && <small className={` text-blue-500`}>{'直行)'}</small>}
                        {directReturn && <small className={` text-blue-500`}>{'直帰)'}</small>}
                        <span>{User?.name}: </span>

                        {from && (
                          <>
                            <span>{from}</span>
                          </>
                        )}
                        {(from || to) && <small>~</small>}
                        {to && (
                          <>
                            <span>{to}</span>
                          </>
                        )}
                      </R_Stack>
                    )

                    return (
                      <div key={i}>
                        <R_Stack
                          className={[
                            important ? ' rounded-sm bg-orange-300  px-1' : shokucho ? ' rounded-sm bg-green-300  px-1' : ' ',
                          ].join(` `)}
                        >
                          <div>{currentShiftDisplay}</div>
                          <div>{nextShiftDisplay}</div>
                        </R_Stack>
                      </div>
                    )
                  })}
                </R_Stack>

                <div>
                  <span>{subTasks.join(`\n`)}</span>
                </div>
              </C_Stack>
            )
          })}
        </C_Stack>
      </section>
    </Padding>
  )
}
