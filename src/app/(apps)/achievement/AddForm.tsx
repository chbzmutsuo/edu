'use client'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {toast} from 'react-toastify'

import {record} from '@app/(apps)/achievement/AchievementCC'
import {Fields} from '@class/Fields/Fields'
import {colType} from '@cm/types/types'
import {Button} from '@components/styles/common-components/Button'
const register = {required: `必須です`}
const AddForm = ({currentStore, setformData, handleClose, userOptions, users, selected}) => {
  const columns = Fields.transposeColumns(
    [
      {id: `date`, label: `日付`, type: `date`},
      {id: `storeName`, label: `店舗名`, type: ``, form: {defaultValue: currentStore?.storeName, disabled: true}},
      {
        id: `stuff`,
        label: `社員`,
        type: ``,
        forSelect: {
          optionsOrOptionFetcher: userOptions.map(user => ({value: user.stuffCode, name: `[${user.stuffCode}] ${user.name}`})),
        },
      },
      {id: `callOut`, label: `声かけ件数`, type: `number`},
      {id: `achievement`, label: `実績件数`, type: `number`},
    ].map(col => {
      return {...col, form: {...col.form, register}} as colType
    })
  )
  const {BasicForm, latestFormData} = useBasicFormProps({
    columns,
    formData: {
      date: new Date(),
      ...selected,
      stuff: selected?.stuffCode,
    },
  })
  const onSubmit = async data => {
    const isUpdateMode = selected.date

    const theStuff = users.find(user => {
      return user.stuffCode === data.stuff
    })

    const {date, callOut, achievement} = data

    const record: record = {
      storeName: currentStore.storeName,
      date,
      callOut,
      achievement,
      stuffCode: theStuff.stuffCode,
      stuffName: theStuff.name,
      stuffType: theStuff.type,
    }
    setformData(prev => {
      if (isUpdateMode) {
        return prev.map(prevRecord => {
          if (prevRecord.date.getTime() === isUpdateMode.getTime()) {
            return record
          }
          return prevRecord
        })
      } else {
        return [...prev, record]
      }
    })

    handleClose(null)
    toast.success(`追加しました`)
  }
  return (
    <>
      <BasicForm onSubmit={onSubmit} latestFormData={latestFormData}>
        <Button>追加</Button>
      </BasicForm>
    </>
  )
}

export default AddForm
