import {C_Stack} from '@components/styles/common-components/common-components'
import React from 'react'

export default function SelectedItems({selectedComponents}) {
  return (
    <>
      {selectedComponents.length === 0 && <div>表示する項目を選択してください</div>}
      <C_Stack className={`w-full items-center gap-20`}>
        {selectedComponents.map((item, idx) => {
          return (
            <div key={idx} className={`w-full`}>
              <h2 className={`bg-primary-main my-2 text-center text-white`}>{item.label}</h2>
              {item.component}
            </div>
          )
        })}
      </C_Stack>
    </>
  )
}
