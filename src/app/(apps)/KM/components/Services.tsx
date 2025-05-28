'use client'

import {C_Stack, MyContainer, Padding} from '@cm/components/styles/common-components/common-components'

import {getSecondLayerMenus} from '@app/(apps)/KM/components/common'
import {ParameterCard} from '@components/styles/common-components/ParameterCard'

export const Services = ({kaizenClient}) => {
  return (
    <MyContainer>
      <C_Stack className={`gap-6`}>
        {getSecondLayerMenus({kaizenClient}).map((menu, index) => {
          const {value, label, id} = menu
          return (
            <div id={id} key={id}>
              <Padding>
                <ParameterCard
                  key={index}
                  {...{
                    label: <strong className={`text-primary-main text-shadow text-2xl`}>{label}</strong>,
                    value: <div>{value}</div>,
                    styling: {
                      styles: {
                        wrapper: {background: 'white', padding: 20},
                      },
                    },
                  }}
                />
              </Padding>
            </div>
          )
        })}
      </C_Stack>
    </MyContainer>
  )
}
