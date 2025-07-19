'use client'

import React, {useState, useCallback, useRef, useEffect} from 'react'
import {upsertUserWorkStatus} from '@app/(apps)/tbm/(server-actions)/userWorkStatusActions'
import {toast} from 'react-toastify'
import {TBM_CODE} from '@app/(apps)/tbm/(class)/TBM_CODE'
import {Code} from '@cm/class/Code'
import {cn} from '@cm/shadcn/lib/utils'

type InlineEditFieldProps = {
  value: string | number | null
  userId: number
  date: Date
  fieldName: string
  placeholder?: string
  type?: 'text' | 'number' | 'time'
  onUpdate?: () => void
  select?: {
    options: {label: string; value: string}[]
  }
} & any

const InlineEditField: React.FC<InlineEditFieldProps> = ({
  value,
  userId,
  date,
  fieldName,
  placeholder = '',
  type = 'text',
  onUpdate,
  select,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value?.toString() || '')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<any>(null)

  useEffect(() => {
    setCurrentValue(value?.toString() || '')
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleSave = useCallback(
    async (e?: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e?.target?.value || currentValue
      if (isLoading) return

      // 既存のタイムアウトをクリア
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }

      // デバウンス処理（500ms待機）
      const timeout = setTimeout(async () => {
        setIsLoading(true)
        try {
          let processedValue: any = newValue

          // 数値系フィールドの処理
          if (type === 'number' || fieldName.includes('Minutes')) {
            processedValue = newValue ? parseInt(newValue, 10) : null
          }

          const result = await upsertUserWorkStatus({
            userId,
            date,
            [fieldName]: processedValue,
          })
          toast.success('更新しました')
          setIsEditing(false)
          onUpdate?.()
        } catch (error) {
          console.error(error)
          toast.error('エラーが発生しました')
          setCurrentValue(newValue?.toString() || '')
        } finally {
          setIsLoading(false)
        }
      }, 200)

      setDebounceTimeout(timeout)
    },
    [currentValue, userId, date, fieldName, type, value, onUpdate, isLoading, debounceTimeout]
  )

  const handleCancel = useCallback(() => {
    setCurrentValue(value?.toString() || '')
    setIsEditing(false)
  }, [value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  const formatDisplayValue = useCallback(
    (val: string | number | null) => {
      if (!val) return ''

      // 時間フィールドの場合、分を hh:mm 形式に変換
      if (type === 'time' && typeof val === 'number') {
        const hours = Math.floor(val / 60)
        const minutes = val % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }

      return val.toString()
    },
    [type]
  )

  const getInputProps = () => {
    const baseProps = {
      ref: inputRef,
      value: currentValue,
      onChange: e => {
        setCurrentValue(e.target.value)
        // if (select) {
        handleSave(e)
        // }
      },
      // onBlur: e => {
      //   handleSave(e)
      // },
      onKeyDown: handleKeyDown,
      placeholder,
      disabled: isLoading,
      className: 'w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500',
    }

    if (fieldName === 'workStatus') {
      return {
        ...baseProps,
        list: 'workStatusOptions',
      }
    }

    if (type === 'time') {
      return {
        ...baseProps,
        type: 'time',
        step: '60', // 1分刻み
      }
    }

    if (type === 'number') {
      return {
        ...baseProps,
        type: 'number',
        min: '0',
      }
    }

    return baseProps
  }

  const inputProps = getInputProps()

  const Input = () => {
    return (
      <>
        <input {...inputProps} />
        <datalist id="workStatusOptions">
          {new Code(TBM_CODE.WORK_STATUS.KBN).array.map(item => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </datalist>

        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </>
    )
  }

  const Select = () => {
    return (
      <select {...inputProps} className={cn(inputProps.className, 'w-[100px]')}>
        <option value="">{placeholder}</option>
        {select?.options.map(item => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    )
  }

  const empty = value === '00:00' || !value
  return (
    <div className={empty ? 'text-gray-400  opacity-100 bg-gray-200 ' : ''}>
      <div className="relative  ">{select ? <Select /> : <Input />}</div>
    </div>
  )

  const displayValue = formatDisplayValue(value)

  return (
    <div
      className="min-h-[20px] px-1 py-0.5 text-xs cursor-pointer hover:bg-gray-100 rounded transition-colors"
      onClick={() => setIsEditing(true)}
      title="クリックして編集"
    >
      {displayValue || <span className="text-gray-400">{placeholder}</span>}
    </div>
  )
}

export default InlineEditField
