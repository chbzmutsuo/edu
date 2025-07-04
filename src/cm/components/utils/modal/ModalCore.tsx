'use client'
import React, {CSSProperties, JSX} from 'react'

import ShadModal from '@cm/shadcn-ui/components/ShadModal'

export type basicModalPropType = {
  toggle?: JSX.Element
  open?: any
  handleClose?: any
  withPaper?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  style?: object
  alertOnClose?: string | boolean
  closeBtn?: boolean | JSX.Element
}
export type ModalCorePropType = basicModalPropType & {
  show: boolean
  setshow: any
}

const getAlertOnClose = (props: ModalCorePropType) => {
  let result: any = `保存されていないデータは破棄されますが、よろしいですか？`
  if (typeof props.alertOnClose === `string`) {
    result = props.alertOnClose
  } else if (!props.alertOnClose) {
    result = false
  }
  return result
}
const getOpen = (props: ModalCorePropType) => {
  let open = props.open
  const simpleModalMode = !open && !props.handleClose
  if (simpleModalMode) {
    open = props.show
  }
  return {open, simpleModalMode}
}

export const ModalCore = React.memo((props: ModalCorePropType) => {
  const {toggle, style, children, handleClose, title, description, withPaper = true, show, setshow} = props
  const alertOnClose = getAlertOnClose(props)
  const {open, simpleModalMode} = getOpen(props)

  const customHandleClose = () => {
    let newHadnleClose = handleClose

    if (simpleModalMode) {
      newHadnleClose = () => setshow(false)
    }
    if (alertOnClose && confirm(String(alertOnClose)) === false) {
      return
    }

    newHadnleClose()
  }

  const modalStyle = {
    width: 'fit-content',
    height: 'fit-content',
    maxHeight: '80vh', //スマホ時に、アドレスバーで隠れてしまうので、これ以上上げない
    maxWidth: '95vw',
    overflow: 'auto',
    ...style,
  }

  return (
    <ShadModal
      {...{
        open,
        onOpenChange: customHandleClose,
        DialogTrigger: toggle,
        style: modalStyle,
        children,
        handleClose,
        title,
        description,
        withPaper,
        show,
        setshow,
      }}
    />
  )
  // return (
  //   <Dialog open={toggle ? undefined : Boolean(open)} onOpenChange={customHandleClose}>
  //     {toggle && (
  //       <DialogTrigger asChild>
  //         <div onClick={() => setshow(prev => !prev)}>{toggle}</div>
  //       </DialogTrigger>
  //     )}
  //     <DialogPortal>
  //       <DialogContent style={modalStyle} className={`bg-white rounded-2xl shadow-lg shadow-gray-500 border border-gray-200 p-2`}>
  //         <DialogHeader>
  //           <DialogTitle>{title}</DialogTitle>
  //           <DialogDescription>{description}</DialogDescription>
  //         </DialogHeader>

  //         <div>{children}</div>

  //         <DialogFooter></DialogFooter>
  //       </DialogContent>
  //     </DialogPortal>
  //   </Dialog>
  // )
})
