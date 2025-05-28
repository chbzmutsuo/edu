import BasicModal from 'src/cm/components/utils/modal/BasicModal'
import {useState} from 'react'
import {basicModalPropType} from '@components/utils/modal/ModalCore'

const useModal = (props?: {defaultOpen?: boolean; defaultState?: any}) => {
  const [open, setopen] = useState<any>(props?.defaultState || props?.defaultOpen ? true : false)
  const handleOpen = (openValue?: any) => setopen(openValue || true)
  const handleClose = (closeValue?: any) => setopen(closeValue || false)

  const Modal = (props: basicModalPropType) => {
    return <BasicModal {...{open, handleClose, ...props}}>{props.children}</BasicModal>
  }

  return {
    Modal,
    handleOpen,
    handleClose,
    open,
    setopen,
  }
}

export default useModal
