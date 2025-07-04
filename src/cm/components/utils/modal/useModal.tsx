import {useCallback, useState} from 'react'
import {basicModalPropType} from '@components/utils/modal/ModalCore'
import ShadModal from '@cm/shadcn-ui/components/ShadModal'

const useModal = (props?: {defaultOpen?: boolean; defaultState?: any}) => {
  const [open, setopen] = useState<any>(props?.defaultState || props?.defaultOpen ? true : false)
  const handleOpen = (openValue?: any) => setopen(openValue || true)
  const handleClose = (closeValue?: any) => setopen(closeValue || false)

  const Modal = useCallback(
    (props: basicModalPropType) => {
      return (
        <ShadModal
          {...{
            open,
            onOpenChange: setopen,
            ...props,
          }}
        >
          {props.children}
        </ShadModal>
      )
    },
    [open, handleClose]
  )

  return {
    Modal,
    handleOpen,
    handleClose,
    open,
    setopen,
  }
}

export default useModal
