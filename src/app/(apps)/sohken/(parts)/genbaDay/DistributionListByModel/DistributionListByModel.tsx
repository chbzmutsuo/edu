'use client'
import {Absolute, C_Stack} from '@cm/components/styles/common-components/common-components'

import {Z_INDEX} from '@cm/lib/constants/constants'

import {useShiftEditFormModal} from '@app/(apps)/sohken/hooks/useShiftEditFormModal'

import {DSBM_List} from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/DSBM_List'
import {DSBM_Label} from '@app/(apps)/sohken/(parts)/genbaDay/DistributionListByModel/DSBM_Label'
import {twMerge} from 'tailwind-merge'
import {Alert, TextRed} from '@components/styles/common-components/Alert'

export const DistributionListByModel = ({
  editable,
  GDS_DND,
  setGDS_DND,
  GenbaDay,
  ArrayData,
  baseModelName,
  RelationalModel,
  iconBtn,
}) => {
  const ShiftEditFormModalGMF = useShiftEditFormModal()
  const highlightedStyle = {zIndex: Z_INDEX.modal + 100}
  const isSelectedType = GDS_DND?.itemType === RelationalModel
  const globalFormStateCommonProps = {baseModelName, selectedData: null, RelationalModel, GenbaDay}

  const DND_Props = {
    GDS_DND,
    setGDS_DND,
    GenbaDay,
    genbaId_from: GDS_DND?.fromGenbaId,
    genbaId_to: GenbaDay.genbaId,
    genbaDayId_to: GenbaDay.id,
    genbaDayId_from: GDS_DND?.fromGenbaDayId,
    hasSameDayWithPickedId: ArrayData.some(v => {
      return (GDS_DND?.userId && v.userId === GDS_DND?.userId) || (GDS_DND?.sohkenCarId && v.sohkenCarId === GDS_DND?.sohkenCarId)
    }),
  }

  DND_Props[`isSameGenba`] = DND_Props.genbaDayId_from === DND_Props.genbaDayId_to
  DND_Props[`unswitchable`] = DND_Props.hasSameDayWithPickedId && !DND_Props[`isSameGenba`]

  const common = {
    editable,
    iconBtn,
    isSelectedType,
    ShiftEditFormModalGMF,
    globalFormStateCommonProps,
    RelationalModel,
    GenbaDay,
    highlightedStyle,
    ArrayData,
    DND_Props,
  }

  return (
    <div>
      <C_Stack
        className={twMerge(`relative t-paper  w-[200px]   gap-0.5 overflow-auto rounded-sm border p-1 text-[14px] leading-5`)}
      >
        {DND_Props[`unswitchable`] && (
          <Absolute top={18}>
            <Alert color="red" className={`w-[170px] text-center`}>
              <TextRed>配置不可</TextRed>
            </Alert>
          </Absolute>
        )}

        <DSBM_Label {...common} />
        <DSBM_List {...common} />
      </C_Stack>
    </div>
  )
}
