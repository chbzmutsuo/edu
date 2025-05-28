'use client'
import React from 'react'

import {atomKey, useJotaiByKey} from '@hooks/useJotai'
import {basicModalPropType, ModalCore} from '@components/utils/modal/ModalCore'

const GlobalModal = React.memo((props: basicModalPropType & {id: string}) => {
  const modalId = `modal_${props.id}` as atomKey

  const [show, setshow] = useJotaiByKey<any>(modalId, null)

  return <ModalCore {...{...props, show, setshow}} />
})

export default GlobalModal
