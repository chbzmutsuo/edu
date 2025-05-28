'use client'
import React, {JSX, useCallback, useMemo, useRef} from 'react'
import {Dialog} from '@headlessui/react'
import {anyObject} from '@cm/types/types'
import {myModalDefault} from 'src/cm/constants/defaults'
import {XMarkIcon} from '@heroicons/react/20/solid'
import {Z_INDEX} from 'src/cm/lib/constants/constants'

import {Center} from '@components/styles/common-components/common-components'
export type basicModalPropType = {
  closeBtn?: boolean | JSX.Element
  open?: boolean | anyObject | null
  handleClose?: any
  title?: any
  description?: any
  toggleBtn?: JSX.Element
  btnComponent?: JSX.Element
  style?: object
  children: any
  alertOnClose?: string | boolean
  allowOuterClick?: boolean
  withPaper?: boolean
}
export type ModalCorePropType = basicModalPropType & {
  show: boolean
  setshow: any
}

export const ModalCore = React.memo((props: ModalCorePropType) => {
  const {
    closeBtn = true,
    btnComponent,
    style,
    children,
    handleClose,
    title,
    description,
    allowOuterClick = true,
    withPaper = true,
    show,
    setshow,
  } = props

  let alertOnClose: any = `保存されていないデータは破棄されますが、よろしいですか？`
  if (typeof props.alertOnClose === `string`) {
    alertOnClose = props.alertOnClose
  } else if (!props.alertOnClose) {
    alertOnClose = false
  }
  const {open, simpleModalMode} = useMemo(() => {
    let {open} = props
    const simpleModalMode = !open && !handleClose
    if (simpleModalMode) {
      open = show
    }
    return {open, simpleModalMode}
  }, [props.open, props.handleClose, show])

  const ToggleBtn = useCallback(() => {
    return <Center onClick={() => setshow(prev => !prev)}>{btnComponent}</Center>
  }, [btnComponent])

  const customeHandleClose = e => {
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
    ...(withPaper
      ? {
          backgroundColor: `white`,
          borderRadius: `10px`,
          padding: `10px`,
        }
      : {}),
  }
  const hiddenInputRef = useRef(null)

  return (
    <>
      <ToggleBtn />
      {open && (
        <Main
          {...{
            closeBtn,
            open,
            title,
            description,
            children,
            allowOuterClick,
            hiddenInputRef,
            customeHandleClose,
            modalStyle,
          }}
        />
      )}
    </>
  )
})

const Main = ({
  closeBtn,
  open,
  title,
  description,
  children,
  allowOuterClick = true,
  hiddenInputRef,
  customeHandleClose,
  modalStyle,
}) => {
  return (
    <Dialog
      initialFocus={hiddenInputRef}
      open={Boolean(open)}
      onClose={e => {
        return
      }}
      style={{zIndex: Z_INDEX.overlay}}
      className="fixed inset-0"
    >
      <div
        style={{zIndex: Z_INDEX.overlay}}
        className="fixed inset-0 bg-black/50  "
        onClick={e => {
          if (allowOuterClick) {
            customeHandleClose(e)
          }
        }}
      />

      <Center>
        <div style={{...modalStyle, zIndex: Z_INDEX.modal}}>
          {closeBtn &&
            (typeof closeBtn === `object` ? (
              closeBtn
            ) : (
              <div className={`mb-6 px-1`}>
                <XMarkIcon
                  onClick={customeHandleClose}
                  className={`text-sub-main absolute  right-2 top-2 w-7  cursor-pointer rounded-full bg-none   transition-all duration-200  [z-index:99999] hover:scale-125`}
                />
              </div>
            ))}

          <input type="hidden" ref={hiddenInputRef} />
          {/* //タイトル */}
          {title && (
            <Dialog.Title as="h3" className="Description-lg Description-gray-900 font-medium leading-6">
              {title}
            </Dialog.Title>
          )}

          {description && <Dialog.Description className=" text-sm text-gray-500">{description}</Dialog.Description>}

          {/* 中身 */}
          <div>{children}</div>
        </div>
      </Center>
    </Dialog>
  )
}
