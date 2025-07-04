'use client'
import {C_Stack, R_Stack} from '@cm/components/styles/common-components/common-components'

import {Pipette} from 'lucide-react'

import {twMerge} from 'tailwind-merge'
import {IconBtn} from '@components/styles/common-components/IconBtn'
export const DSBM_List = ({
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
  const {GDS_DND, setGDS_DND} = DND_Props
  const {itemType, id} = GDS_DND ?? {}
  const selectedClass = `animate-pulse rounded-sm bg-green-400 p-1 shadow-sm`
  const LinkComponent = editable
    ? props => {
        return <IconBtn {...props}>{props.children}</IconBtn>
      }
    : ({children}) => <>{children}</>

  return (
    <C_Stack className={twMerge(` gap-0.5 leading-5`)}>
      {ArrayData?.map((v, i) => {
        const color = v.status === `完了` ? `#caffd1` : v.status === `未完了` ? `#ffc0c0` : undefined
        const selected = itemType === RelationalModel && id === v.id

        return (
          <div key={i} className={`${selected ? `${selectedClass}` : ''} mb-1 border-b`}>
            <R_Stack className={` flex-nowrap gap-0.5`}>
              {editable && (
                <>
                  <Pipette
                    style={{
                      ...(isSelectedType
                        ? {
                            ...(GDS_DND?.fromGenbaId === v.id && {
                              background: `white`,
                              ...highlightedStyle,
                            }),
                          }
                        : {}),
                    }}
                    className={`onHover w-5 rounded-full `}
                    onClick={() => {
                      setGDS_DND({
                        id: v.id,
                        fromGenbaId: v.genbaId,
                        fromGenbaDayId: v.genbaDayId,
                        userId: v.userId,
                        sohkenCarId: v.sohkenCarId,
                        itemType: RelationalModel,
                      })
                    }}
                  />
                </>
              )}

              <LinkComponent
                {...{
                  onClick: () => ShiftEditFormModalGMF.setGMF_OPEN({...globalFormStateCommonProps, selectedData: v}),
                  color: color,
                  className: ` truncate ${color ? '' : 'onHover '}`,
                }}
              >
                <R_Stack className={`gap-0.5`}>
                  <small>{i + 1}</small>
                  {v.name}
                </R_Stack>
              </LinkComponent>
            </R_Stack>
          </div>
        )
      })}
    </C_Stack>
  )
}
