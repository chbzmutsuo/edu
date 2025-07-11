'use client'
import {C_Stack} from '@cm/components/styles/common-components/common-components'
import React, {useEffect, useState} from 'react'

import {Button} from '@components/styles/common-components/Button'
import useModal from '@components/utils/modal/useModal'
import {formatDate} from '@class/Days/date-utils/formatters'
import {toUtc} from '@class/Days/date-utils/calculations'
import BasicModal from '@components/utils/modal/BasicModal'

import { CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'

import {handleCopyTask, taskObj} from '@app/(apps)/sohken/(parts)/Tasks/HandleBulkUpsertTask'

export const TaskAsignBtn = ({Genba, allTasks, router}) => {
  const {Modal, handleClose, handleOpen, open} = useModal()

  const defaultActiveTasks = Object.fromEntries(
    allTasks.map(task => {
      const key = task.name
      const hasTheTaskConfig = Genba?.GenbaTask?.find(v => v.name === key)

      const value = {...task, ...hasTheTaskConfig}

      value.color = hasTheTaskConfig?.color ?? task.color

      return [key, value]
    })
  )

  const [activeTasks, setactiveTasks] = useState<{[key in string]: taskObj}>(defaultActiveTasks)

  useEffect(() => {
    setactiveTasks(defaultActiveTasks)
  }, [open])

  function getSelectedTaskArray() {
    const selectedTaskArray: taskObj[] = Object.entries(activeTasks)
      .filter(d => {
        const value = d[1]
        return value?.checked
      })
      .map(d => d[1])

    return {selectedTaskArray}
  }

  const {selectedTaskArray} = getSelectedTaskArray()

  const inputClass = ` border-b bg-gray-50 p-0.5 px-1 w-32`

  const records = getRecords()
  return (
    <div>
      <BasicModal
        {...{
          alertOnClose: `反映確定していない情報は、リセットされますがよろしいですか？`,
          open: open,
          handleClose,
          toggle: (
            <div className={` text-center text-xs`}>
              <Button onClick={handleOpen}>マスタから登録</Button>
            </div>
          ),
        }}
      >
        <C_Stack className={`items-center`}>
          <Button
            onClick={async () => {
              await handleCopyTask({
                activeTasks,
                Genba,
                handleClose,
                router,
                selectedTaskArray, //あとで直す
              })
            }}
          >
            登録
          </Button>
          {CsvTable({records}).WithWrapper({})}
        </C_Stack>
      </BasicModal>
    </div>
  )

  function getRecords() {
    const records = allTasks.map(task => {
      const {name, color} = task

      const doUpdate = !!activeTasks[name]?.checked
      const handleOnChange = (e, key) => {
        let nextValue = e.target.type === `checkbox` ? e.target.checked : e.target.value

        if (key === 'from' || key === 'to') {
          nextValue = toUtc(nextValue)
        }
        if (key === 'requiredNinku') {
          nextValue = Number(nextValue)
        }

        setactiveTasks(prev => ({
          ...prev,
          [name]: {
            ...prev[name],
            checked: true,
            [key]: nextValue,
          },
        }))

        if (key === `from` && !activeTasks[`to`]) {
          setactiveTasks(prev => ({
            ...prev,
            [name]: {
              ...prev[name],
              to: nextValue,
            },
          }))
        }
      }

      return {
        className: `[&_td]:p-2!  ${doUpdate ? '' : 'opacity-30'}`,
        csvTableRow: [
          {
            label: `追加`,
            cellValue: (
              <input
                {...{
                  type: `checkbox`,
                  className: `w-5 border h-5`,
                  checked: doUpdate ?? false,
                  onChange: e => handleOnChange(e, `checked`),
                }}
              />
            ),
          },
          {
            label: `タスク名`,
            cellValue: (
              <input
                {...{
                  className: inputClass,
                  type: `text`,
                  value: name ?? '',
                  disabled: true,
                  onChange: e => handleOnChange(e, `name`),
                }}
              />
            ),
          },
          {
            label: `色`,
            cellValue: (
              <input
                {...{
                  className: inputClass,
                  type: `color`,
                  value: activeTasks[name]?.color ?? '',
                  onChange: e => handleOnChange(e, `color`),
                }}
              />
            ),
          },
          {
            label: `日付`,
            cellValue: (
              <input
                {...{
                  className: inputClass,
                  type: `date`,
                  value: formatDate(activeTasks[name]?.from) ?? '',
                  onChange: e => handleOnChange(e, `from`),
                }}
              />
            ),
          },
          {
            label: `終了日`,
            cellValue: (
              <input
                {...{
                  className: inputClass,
                  type: `date`,
                  value: formatDate(activeTasks[name]?.to) ?? '',
                  onChange: e => handleOnChange(e, `to`),
                }}
              />
            ),
          },
          {
            label: `人工`,
            cellValue: (
              <input
                {...{
                  className: inputClass,
                  type: `number`,
                  value: activeTasks[name]?.requiredNinku ?? '',
                  onChange: e => handleOnChange(e, `requiredNinku`),
                }}
              />
            ),
          },
        ],
      }
    })

    return records
  }
}
