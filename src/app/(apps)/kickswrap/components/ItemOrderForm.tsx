'use client'

import {Fields} from '@cm/class/Fields/Fields'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Button} from '@cm/components/styles/common-components/Button'
import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {Paper} from '@cm/components/styles/common-components/paper'

const ItemOrderForm = ({items, registerdItems, filteredItems, setregisterdItems, getCategories, category, setcategory}) => {
  const columns = Fields.transposeColumns([
    {
      id: `item`,
      label: `商品`,
      forSelect: {
        option: {
          style: {width: 280, fontSize: 14},
        },
        optionsOrOptionFetcher: filteredItems.map(item => {
          return `【${item.itemCode}】\n${item.name}`
        }),
      },
    },
    {
      id: `quantity`,
      label: `数量`,
      type: `number`,
      form: {},
    },
  ])
  const {BasicForm, latestFormData, ReactHookForm} = useBasicFormProps({columns})

  const onSubmit = () => {
    const data = latestFormData
    if (!data.item) {
      return alert(`商品と数量を入力してください`)
    }
    const itemCode = data.item.match(/【(.+)】/)[1]
    const itemNameModified = data.item.replace(/【.+】/, '').replace(/\n/, '')

    const getItemInfo = items.find(item => item.name === itemNameModified)

    if (data.item) {
      setregisterdItems([...registerdItems, {...data, ...getItemInfo}])
      ReactHookForm.reset()
    }
  }

  return (
    <Paper>
      <R_Stack>
        <select className={`myFormControl w-[150px]`} value={category} onChange={e => setcategory(e.target.value)}>
          <option value={``}>すべて</option>
          {getCategories().map((cat, i) => (
            <option key={i}>{cat}</option>
          ))}
        </select>
        <BasicForm latestFormData={latestFormData} ControlOptions={{ControlStyle: {width: 280}}} alignMode="row"></BasicForm>
        <div className={` mx-auto text-center`}>
          <Button active={latestFormData.item && latestFormData.quantity} type="button" color={`blue`} onClick={() => onSubmit()}>
            追加
          </Button>
        </div>
      </R_Stack>
    </Paper>
  )
}

export default ItemOrderForm
