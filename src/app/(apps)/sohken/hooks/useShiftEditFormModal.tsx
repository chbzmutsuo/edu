import MultipleUserSelector from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/MultipleUserSelector'

import {PrismaModelNames} from '@cm/types/prisma-types'
import {Paper} from '@components/styles/common-components/paper'

import useGlobal from '@hooks/globalHooks/useGlobal'
import {Z_INDEX} from '@lib/constants/constants'
import {atomTypes, useJotaiByKey} from '@hooks/useJotai'

import {C_Stack} from '@components/styles/common-components/common-components'
import useFloatingDiv from '@hooks/useFloatingDiv/useFloatingDiv'
import {useMemo} from 'react'
import MultipleCarSelector from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/MultipleCarSelector'
import {StrHandler} from '@class/StrHandler'

export type shiftEditProps = {
  selectedData
  RelationalModel: PrismaModelNames
  GenbaDay
  baseModelName
} | null

export const useShiftEditFormModal = () => {
  const useGlobalProps = useGlobal()
  const [shiftEditPropsGMF, setshiftEditPropsGMF] = useJotaiByKey<atomTypes[`shiftEditPropsGMF`] | null>(
    `shiftEditPropsGMF`,
    null
  )

  const setGMF_OPEN = (v: shiftEditProps) => {
    setshiftEditPropsGMF(v)
  }
  const GMF_OPEN = shiftEditPropsGMF

  const Modal = () => {
    if (GMF_OPEN) {
      const {DraggableDiv, DragButton} = useFloatingDiv({defaultPosition: {x: 70, y: 70}})
      const {RelationalModel, GenbaDay, selectedData, baseModelName} = GMF_OPEN
      const currentRelationalModelRecords = GenbaDay[StrHandler.capitalizeFirstLetter(RelationalModel)]
      const handleClose = () => setGMF_OPEN(null)
      const commonProps = {
        GenbaDay,
        handleClose,
        useGlobalProps,
      }

      const OverLay = () => {
        return <div onClick={handleClose} className={`fixed inset-0 bg-black/50`} style={{zIndex: Z_INDEX.overlay}}></div>
      }

      const Memo = useMemo(() => {
        return (
          <Paper className={`rounded-lg  bg-white`}>
            <C_Stack>
              {baseModelName === `user` ? (
                <MultipleUserSelector {...commonProps} {...{currentRelationalModelRecords}} />
              ) : (
                <MultipleCarSelector {...commonProps} {...{currentRelationalModelRecords}} />
              )}
            </C_Stack>
          </Paper>
        )
      }, [GMF_OPEN])

      return (
        <div>
          <OverLay />
          <DraggableDiv>{Memo}</DraggableDiv>
        </div>
      )
    }
    return <></>
  }

  return {Modal, GMF_OPEN, setGMF_OPEN}
}
