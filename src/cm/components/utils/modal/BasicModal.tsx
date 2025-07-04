'use client'
import React, {useState} from 'react'

import {basicModalPropType, ModalCore} from '@components/utils/modal/ModalCore'
import ShadModal from '@cm/shadcn-ui/components/ShadModal'

const BasicModal = React.memo((props: basicModalPropType) => {
  const [open, setopen] = useState(false)

  // toggleがクリックされた時にモーダルを開く処理を追加
  // const enhancedToggle = props.toggle ? <div onClick={() => setshow(true)}>{props.toggle}</div> : undefined

  return (
    <ShadModal
      {...{
        ...props,
        DialogTrigger: props.toggle,
        open: open,
        onOpenChange: setopen,
      }}
    />
  )
})

export default BasicModal
