'use client'
import React, {JSX} from 'react'

import {myModalDefault} from 'src/cm/constants/defaults'

import {R_Stack} from '@components/styles/common-components/common-components'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@cm/shadcn-ui/components/ui/dialog'

export type basicModalPropType = {
  closeBtn?: boolean | JSX.Element
  open?: any
  handleClose?: any
  title?: any
  description?: any
  btnComponent?: JSX.Element
  style?: object
  children: any
  alertOnClose?: string | boolean

  withPaper?: boolean
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
  const {btnComponent, style, children, handleClose, title, description, withPaper = true, show, setshow} = props

  const alertOnClose = getAlertOnClose(props)
  const {open, simpleModalMode} = getOpen(props)

  const customeHandleClose = () => {
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
    ...myModalDefault,
    ...style,
    // ...(withPaper
    //   ? {
    //       backgroundColor: `white`,
    //       borderRadius: `10px`,
    //       padding: `10px`,
    //     }
    //   : {}),
  }

  return (
    <Dialog open={btnComponent ? undefined : Boolean(open)} onOpenChange={customeHandleClose}>
      <div>
        {btnComponent && (
          <DialogTrigger asChild>
            <div onClick={() => setshow(prev => !prev)}>{btnComponent}</div>
          </DialogTrigger>
        )}
        <DialogContent style={modalStyle}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div>{children}</div>

          <DialogFooter>
            <R_Stack className={`justify-start`}>
              {/* <DialogClose asChild>
                <Button size="sm">閉じる</Button>
              </DialogClose> */}
            </R_Stack>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  )
})
