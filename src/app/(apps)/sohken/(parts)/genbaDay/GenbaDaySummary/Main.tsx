'use client'

import {LabelValue} from '@cm/components/styles/common-components/ParameterCard'

import {formatDate} from '@cm/class/Days/date-utils/formatters'

import React from 'react'

import {useGenbaDayCardEditorModalGMF} from '@app/(apps)/sohken/hooks/useGenbaDayCardEditorModalGMF'
import GanbaName from '@app/(apps)/sohken/(parts)/genbaDay/GenbaDaySummary/GanbaName'
import {TaskWithNinku} from '@app/(apps)/sohken/(parts)/genbaDay/GenbaDaySummary/TaskWithNinku'
import {useGenbaDayBasicEditor} from '@app/(apps)/sohken/hooks/useGenbaDayBasicEditor'
import {Alert} from '@cm/components/styles/common-components/Alert'
import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'
import {HREF} from '@cm/lib/methods/urls'
import useMyNavigation from '@cm/hooks/globalHooks/useMyNavigation'
import {T_LINK} from '@cm/components/styles/common-components/links'
export default function Main(props: {
  GenbaDayBasicEditor_HK: ReturnType<typeof useGenbaDayBasicEditor>
  pathname: string
  GenbaDayTaskMidTable: any
  GenbaDay: any
  editable: boolean
}) {
  const {query} = useMyNavigation()
  const {GenbaDayBasicEditor_HK, pathname, GenbaDayTaskMidTable, GenbaDay, editable} = props

  const GenbaDayCardEditModal_HK = useGenbaDayCardEditorModalGMF()
  const isDetailPage = pathname.includes(`/genba/`)

  const activateEditFrom = () => {
    if (editable) {
      GenbaDayBasicEditor_HK.setGMF_OPEN({
        GenbaDay,
      })
    }
  }

  const subTasksOnGenbaTask = GenbaDayTaskMidTable.map(item => item?.GenbaTask?.subTask)

  const subTasksOnGenbaDay = GenbaDay.subTask
  const subTasks = [...subTasksOnGenbaTask, subTasksOnGenbaDay]

  const remarksOnGenbaTask = GenbaDayTaskMidTable.map(item => item?.GenbaTask?.remarks)
  const remarksOnGenbaDay = GenbaDay.remarks
  const remarks = [...remarksOnGenbaTask, remarksOnGenbaDay]

  const {Genba} = GenbaDay
  const {warningString} = Genba
  return (
    <div className={` relative`}>
      <section>
        {isDetailPage && (
          <LabelValue {...{label: `日付`}}>
            <T_LINK href={HREF(`/sohken/genbaDay`, {from: formatDate(GenbaDay.date)}, query)}>
              {formatDate(GenbaDay.date, `MM月DD日(ddd)`)}
            </T_LINK>
          </LabelValue>
        )}
        {!isDetailPage && (
          <div>
            <LabelValue {...{label: `現場`}}>
              <GanbaName {...{GenbaDay, editable}} />
            </LabelValue>
          </div>
        )}

        <div>
          {warningString && (
            <LabelValue {...{label: `注意`}}>
              <Alert color="red">{warningString}</Alert>
            </LabelValue>
          )}
        </div>
        <div className={`onHover`} onClick={activateEditFrom}>
          <LabelValue
            {...{
              label: `連絡`,
              styling: {
                classes: {wrapper: `items-start! px-2`},
              },
            }}
          >
            <MarkDownDisplay className={` text-sm leading-4`}>{remarks.join(`\n`)}</MarkDownDisplay>
          </LabelValue>
        </div>
        <div>
          <LabelValue {...{label: `タスク`}}>
            <TaskWithNinku
              {...{
                GenbaDay,
                editable,
                setGenbaDayCardEditModal: GenbaDayCardEditModal_HK.setGMF_OPEN,
                GenbaDayTaskMidTable,
              }}
            />
          </LabelValue>
        </div>

        <div className={`onHover`} onClick={activateEditFrom}>
          <LabelValue
            {...{
              label: `その他`,
              styling: {
                classes: {wrapper: `items-start! px-2`},
              },
            }}
          >
            <MarkDownDisplay className={` text-sm leading-4`}>{subTasks.join(`\n`)}</MarkDownDisplay>
          </LabelValue>
        </div>
      </section>
    </div>
  )
}
