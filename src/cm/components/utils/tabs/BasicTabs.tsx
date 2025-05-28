'use client'

import {C_Stack, R_Stack} from 'src/cm/components/styles/common-components/common-components'
import PlaceHolder from 'src/cm/components/utils/loader/PlaceHolder'
import {JSX} from 'react'
import useWindowSize from 'src/cm/hooks/useWindowSize'
import {cl} from 'src/cm/lib/methods/common'
import {CSSProperties, useEffect} from 'react'

import {TitleDescription} from 'src/cm/components/styles/common-components/Notation'
import {anyObject} from '@cm/types/types'

import {useJotaiByKey, atomTypes} from '@hooks/useJotai'

export type tabComponent = {
  style?: CSSProperties
  exclusiveTo?: boolean
  label?: any
  description?: any
  component: any
  containerClass?: string
}
type BasicTabsType = {
  id: string
  headingText?: string | JSX.Element
  TabComponentArray: tabComponent[]
  showAll?: boolean
  className?: string
  style?: anyObject
}
export default function BasicTabs(props: BasicTabsType) {
  const {width} = useWindowSize()
  const {headingText, id = '', showAll = width > 768, TabComponentArray: tempTabComponentArray, ...otherProps} = props

  const [value, setValue] = useJotaiByKey<atomTypes[`globalCurrentTabIdx`]>(`globalCurrentTabIdx`, {})

  const currentTabIdx = value[id] ?? 0

  const setcurrentTabIdx = newValue => {
    setValue({...value, [id]: newValue})
  }

  // const [currentTabIdx, setcurrentTabIdx] = useState(0)

  const filteredTabComponentArray = props.TabComponentArray.filter(obj => obj?.exclusiveTo !== false)
  const anyTabIsActive = filteredTabComponentArray.some((obj, idx) => currentTabIdx === idx)
  useEffect(() => {
    if (anyTabIsActive === false) {
      setcurrentTabIdx(0)
    }
  }, [anyTabIsActive])

  const maxComponentWidth =
    (filteredTabComponentArray.length > 0 &&
      filteredTabComponentArray.map(data => (data?.style?.width ?? 0) as number)?.reduce((a, b) => Math.max(a, b))) ||
    undefined

  if (!width) return <PlaceHolder />

  return (
    <R_Stack style={{minWidth: maxComponentWidth}} className={'  mx-auto items-stretch justify-around gap-x-2'} {...otherProps}>
      {showAll
        ? renderShowAll({filteredTabComponentArray, currentTabIdx, setcurrentTabIdx, otherProps})
        : renderShowEachComponent({filteredTabComponentArray, currentTabIdx, setcurrentTabIdx, otherProps})}
    </R_Stack>
  )
}

// const [maxWidth, setmaxWidth] = useState(null)
/**全てのコンポーネントをflexで表示 */
const renderShowAll = ({filteredTabComponentArray, currentTabIdx, setcurrentTabIdx, otherProps}) => {
  return (
    <>
      {filteredTabComponentArray.map((obj, idx) => {
        const {containerClass, label, description} = obj ?? {}

        return (
          <div key={idx} className={containerClass + '  p-1 '}>
            <C_Stack className={``}>
              <TitleDescription
                {...{
                  title: label,
                  description: (
                    <div>
                      <hr />
                      {description}
                    </div>
                  ),
                }}
              />

              <div>{obj?.component}</div>
            </C_Stack>
          </div>
        )
      })}
    </>
  )
}

const renderShowEachComponent = ({filteredTabComponentArray, currentTabIdx, setcurrentTabIdx, otherProps}) => {
  const singleTabWidth = Math.floor(100 / filteredTabComponentArray.length) //labelの横幅比率

  const Label = ({obj, i}) => {
    const selected = i === currentTabIdx
    return (
      <div style={{width: singleTabWidth + '%', textAlign: 'center'}}>
        <div
          onClick={e => setcurrentTabIdx(i)}
          className={cl(
            `cursor-pointer`,
            ' mx-auto max-w-[300px] rounded-lg p-1 text-[16px]    ',
            selected ? 'bg-gray-300' : 'hover:bg-gray-200'
          )}
        >
          {obj?.label}
        </div>
      </div>
    )
  }

  return (
    <div {...{...otherProps}}>
      <R_Stack className={cl(`mx-auto mb-2  w-full min-w-[280px]  justify-around gap-0   border-b-2   p-1  `)}>
        {filteredTabComponentArray
          .filter(obj => obj?.label)
          .map((obj, i) => {
            return <Label {...{obj, i}} key={i} />
          })}
      </R_Stack>

      {filteredTabComponentArray.map((obj, i) => {
        const {containerClass = `mx-auto w-fit`} = obj ?? {}
        if (i !== currentTabIdx) return null

        return (
          <div key={i} className={`${containerClass} `}>
            {obj?.component}
          </div>
        )
      })}
    </div>
  )
}
