import BasicModal from '@components/utils/modal/BasicModal'
import {atomKey, useJotaiByKey} from '@hooks/useJotai'
import React, {JSX} from 'react'
export const useGlobalModalForm = <S,>(
  atomKey: atomKey,
  defaultValue: any,
  props?: {
    mainJsx?: (props: {
      GMF_OPEN: S
      setGMF_OPEN

      close: () => void
    }) => JSX.Element
  }
) => {
  const jotai = useJotaiByKey(atomKey, defaultValue)
  const GMF_OPEN = jotai[0] as S | null
  const setGMF_OPEN = jotai[1] as (value: S | null) => S | null

  const close = () => {
    setGMF_OPEN(null)
  }

  const Modal = () => {
    return (
      <>
        {GMF_OPEN && (
          <BasicModal
            {...{
              closeBtn: false,
              open: GMF_OPEN,
              handleClose: () => setGMF_OPEN(null),
            }}
          >
            {props?.mainJsx?.({GMF_OPEN, setGMF_OPEN, close}) ?? <></>}
          </BasicModal>
        )}
      </>
    )

    return <></>
  }

  return {GMF_OPEN, setGMF_OPEN, Modal}
}
