'use client'

import {R_Stack} from 'src/cm/components/styles/common-components/common-components'
import useOnKeyDown from 'src/cm/hooks/useOnKeyDown'

import React, {useEffect, useRef} from 'react'

import {updateOptionsOrigin} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/Search/updateOptionsOrigin'

import {parseContexts} from 'src/cm/components/DataLogic/TFs/MyForm/HookFormControl/Parts/MySelect/lib/useInitMySelect'
import useWindowSize from 'src/cm/hooks/useWindowSize'
import {SearchIcon} from 'lucide-react'
export const SimpleSearchForm = ({contexts}) => {
  const {col, options, handleOptionClick} = parseContexts(contexts)
  const {width, device} = useWindowSize()
  const isStaticOptions = Array.isArray(col?.forSelect?.optionsOrOptionFetcher)

  const update = async input => {
    return await updateOptionsOrigin({input, options, isStaticOptions, contexts})
  }
  const inputRef = useRef<HTMLInputElement>(null)

  const {PC} = useWindowSize()
  useEffect(() => {
    if (PC) {
      inputRef?.current?.focus()
    }
  }, [PC])

  const keyDownProps = useOnKeyDown('Enter', e => update(inputRef.current?.value))

  return (
    <R_Stack>
      <input
        data-usage="search"
        ref={inputRef}
        placeholder="入力後Enter"
        className={` myFormControl w-[160px]  `}
        {...keyDownProps}
      />
      <button
        {...{
          className: `onHover`,
          onClick: () => update(inputRef.current?.value),
        }}
      >
        <SearchIcon className={`text-gray-700`} />
      </button>
    </R_Stack>
  )
}
