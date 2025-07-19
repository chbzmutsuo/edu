import MultipleUserSelector from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/MultipleUserSelector'

import {PrismaModelNames} from '@cm/types/prisma-types'
import {Paper} from '@cm/components/styles/common-components/paper'

import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {Z_INDEX} from '@cm/lib/constants/constants'
import {atomTypes, useJotaiByKey} from '@cm/hooks/useJotai'

import {C_Stack} from '@cm/components/styles/common-components/common-components'
import useFloatingDiv from '@cm/hooks/useFloatingDiv/useFloatingDiv'
import {useMemo} from 'react'
import MultipleCarSelector from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/MultipleCarSelector'
import {StrHandler} from '@cm/class/StrHandler'

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
