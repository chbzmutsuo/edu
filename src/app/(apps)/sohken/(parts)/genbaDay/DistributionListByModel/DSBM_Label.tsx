import {R_Stack} from '@cm/components/styles/common-components/common-components'
import {IconBtn} from '@cm/components/styles/common-components/IconBtn'

import {generalDoStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {PlusIcon} from 'lucide-react'
import {useRouter} from 'next/navigation'
import {chain_sohken_genbaDayUpdateChain} from 'src/non-common/(chains)/getGenbaScheduleStatus/chain_sohken_genbaDayUpdateChain'
import {twMerge} from 'tailwind-merge'

export const DSBM_Label = ({
  editable,
  iconBtn,
  isSelectedType,
  ShiftEditFormModalGMF,
  globalFormStateCommonProps,
  RelationalModel,
  GenbaDay,
  highlightedStyle,
  DND_Props,
  ArrayData,
}) => {
  const iconBtnStyle = {
    padding: 0,
    fontSize: 12,
    ...(isSelectedType ? highlightedStyle : undefined),
  }
  const {
    GDS_DND,
    setGDS_DND,
    genbaId_from,
    genbaId_to,
    genbaDayId_to,
    genbaDayId_from,
    isSameGenba,
    hasSameDayWithPickedId,
    unswitchable,
  } = DND_Props
  const router = useRouter()
  async function asignToGenbaDate() {
    if (unswitchable) {
      return alert('同じカードに重複してデータを配置することはできません。')
    }
    if (GDS_DND && GDS_DND.itemType === RelationalModel) {
      await generalDoStandardPrisma(RelationalModel, `update`, {
        where: {id: GDS_DND.id},
        data: {
          genbaId: GenbaDay.genbaId,
          genbaDayId: GenbaDay.id,
        },
      })

      await chain_sohken_genbaDayUpdateChain({genbaId: genbaId_from})
      await chain_sohken_genbaDayUpdateChain({genbaId: genbaId_to})

      router.refresh()
      setGDS_DND(null)
    }
  }
  const isItemMoveMode = GDS_DND && GDS_DND?.itemType === RelationalModel ? '' : ''

  return (
    <div
      {...{
        className: twMerge(editable ? 'onHover' : '', isItemMoveMode),
        onClick: () => {
          if (GDS_DND) return
          if (editable) {
            ShiftEditFormModalGMF.setGMF_OPEN(globalFormStateCommonProps)
          }
        },
      }}
    >
      <IconBtn
        {...{
          active: true,
          className: ` w-full px-2! py-0.5`,
          disabled: hasSameDayWithPickedId && !isSameGenba,
          style: {
            ...iconBtnStyle,
            ...(hasSameDayWithPickedId && !isSameGenba ? {background: 'gray'} : {}),
          },
          onClick: async () => await asignToGenbaDate(),
          color: isSelectedType ? `green` : iconBtn.color,
        }}
      >
        <R_Stack className={`row-stack justify-between`}>
          <div>{iconBtn.text}</div>
          {editable && <PlusIcon {...{className: `w-5 h-5 bg-white  text-sub-main shadow-sm  rounded-full `}} />}
        </R_Stack>
      </IconBtn>
    </div>
  )
}
