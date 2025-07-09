'use client'
import React from 'react'

import {atomKey, useJotaiByKey} from '@hooks/useJotai'
import {basicModalPropType, ModalCore} from '@components/utils/modal/ModalCore'

const GlobalModal = React.memo((props: basicModalPropType & {id: string}) => {
  const modalId = `modal_${props.id}` as atomKey
  const [openState, setopenState] = useJotaiByKey<any>(modalId, null)
  const open = props?.open ?? openState
  const setopen = props?.setopen ?? setopenState
  return <ModalCore {...{...props, open, setopen}} />
})

export default GlobalModal
