'use client'
import React, {useState} from 'react'

import {basicModalPropType, ModalCore} from '@components/utils/modal/ModalCore'

const BasicModal = React.memo((props: basicModalPropType) => {
  const [show, setshow] = useState(false)
  return <ModalCore {...{...props, show, setshow}} />
})

export default BasicModal
