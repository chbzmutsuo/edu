import Label from '@shadcn/ui/Organisms/form/Label'
import useFormProps from '@shadcn/ui/Organisms/form/useFormProps'
import {cn} from '@shadcn/lib/utils'
import React, {useEffect, useRef, useState} from 'react'

type option = {value: string; label: string}
export type SelectProps = formPropType & {
  options: option[]
  setter?: (props: {selectedOption: option}) => void
  selectType?: 'normal' | 'dataList' | 'radio'
  arrowEmpty?: boolean
  flexMode?: 'row' | 'col'
}
export default function Select(props: SelectProps) {
  const {
    selectProps: {options, setter, selectType = 'dataList', arrowEmpty = true, flexMode = 'row'},
    customProps,
    label,
  } = useFormProps(props)

  const {name, value = ''} = customProps

  const getSelectedOption = (input, dataKey) => options?.find(option => option[dataKey] === input)

  if (selectType === 'normal') {
    return <NormalSelect {...{options, customProps, label, arrowEmpty}} />
  }

  if (selectType === 'radio') {
    return <RadioSelect {...{options, setter, customProps, label, name, getSelectedOption, flexMode}} />
  }

  if (selectType === 'dataList') {
    return <DataListSelect {...{options, setter, customProps, label, name, value, getSelectedOption}} />
  }

  return null
}

const NormalSelect = ({options, customProps, label, arrowEmpty}) => {
  return (
    <div className={`relative`}>
      <Label required={customProps.required}>{label}</Label>
      <select {...customProps}>
        {arrowEmpty && <option value={''}>選択してください</option>}
        {options?.map(({value, label}, idx) => (
          <option key={idx} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}

const RadioSelect = ({options, setter, customProps, label, name, getSelectedOption, flexMode}) => {
  const handleRadioChange = e => {
    if (setter) {
      const selectedValue = e.target.value
      const selectedOption = getSelectedOption(selectedValue, 'value')
      if (selectedOption) {
        setter({selectedOption})
      }
    } else if (customProps.onChange) {
      customProps.onChange(e)
    }
  }

  const disabled = customProps.disabled

  const ButtonFormatter = (props: {option: option; children: React.ReactNode}) => {
    const {option, children} = props
    const {value, label} = props.option
    return (
      <div
        className={cn(
          //
          `rounded-lg bg-gray-50 p-0.5 shadow px-1 border  text-sm`,
          customProps.value === value && 'bg-blue-300/20 border-blue-500  border-2'
        )}
      >
        {children}
      </div>
    )
  }

  const ButtonListWrapper = ({children}) => {
    // const flexModeClass = flexMode === 'row' ? 'flex flex-row gap-2' : 'flex flex-col gap-2'

    return <div className={cn(customProps.className, 'bg-transparent')}>{children}</div>
  }

  return (
    <div className="relative">
      <Label required={customProps.required}>{label}</Label>

      <ButtonListWrapper>
        {options?.map((option, idx) => {
          const {value, label} = option
          return (
            <div key={idx}>
              <ButtonFormatter option={option}>
                <label className={cn('flex items-center gap-2 cursor-pointer', disabled && ' pointer-events-none')}>
                  <input
                    disabled={disabled}
                    type="radio"
                    name={name}
                    value={value}
                    checked={customProps.value === value}
                    onChange={e => handleRadioChange(e)}
                    className="w-4 h-4"
                  />
                  {label}
                </label>
              </ButtonFormatter>
            </div>
          )
        })}
      </ButtonListWrapper>
    </div>
  )
}

const DataListSelect = ({options, setter, customProps, label, name, value, getSelectedOption}) => {
  const [inputState, setinputState] = useState(value)
  const ref = useRef(null)

  useEffect(() => {
    const selectedOption = getSelectedOption(value, 'value')
    setinputState(selectedOption?.label)
  }, [value])
  const handleConfirm = ({selectedOption}) => {
    if (selectedOption) {
      setter({selectedOption})
    } else {
      setinputState(null)
      alert('存在しない選択肢です')
    }
  }

  const handleOnChange = e => {
    setinputState(e.target.value)

    const selectedOption = getSelectedOption(e.target.value, 'value')
    if (selectedOption) {
      setinputState(selectedOption.label)
      handleConfirm({selectedOption})
    }
  }

  const userName = options.find(option => option.value === value)?.label

  return (
    <div className={` relative`}>
      <Label required={customProps.required}>{label}</Label>
      <input {...customProps} ref={ref} value={inputState ?? userName ?? ''} onChange={handleOnChange} list={`list-${name}`} />
      <datalist id={`list-${name}`}>
        {options?.map(({value, label}, idx) => {
          return (
            <option key={idx} value={value}>
              {label}
            </option>
          )
        })}
      </datalist>
    </div>
  )
}
