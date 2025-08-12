'use client'

import {MyContainer, Padding} from '@cm/components/styles/common-components/common-components'

import {getSecondLayerMenus} from '@app/(apps)/KM/components/common'
import {ParameterCard} from '@cm/components/styles/common-components/ParameterCard'

export const Services = ({kaizenClient}) => {
  return (
    <MyContainer>
      <div>
        {getSecondLayerMenus({kaizenClient}).map((menu, index) => {
          const {value, label, id} = menu
          return (
            <div id={id} key={id}>
              <Padding>
                <div>
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
                </div>
              </Padding>
            </div>
          )
        })}
      </div>
    </MyContainer>
  )
}
