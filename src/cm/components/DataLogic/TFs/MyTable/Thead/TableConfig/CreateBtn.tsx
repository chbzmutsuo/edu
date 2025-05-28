import {TableConfigPropsType} from 'src/cm/components/DataLogic/TFs/MyTable/TableConfig'
import React from 'react'
import {Button} from '@components/styles/common-components/Button'

export default function CreateBtn(props: {TableConfigProps: TableConfigPropsType}) {
  const {setformData, myTable} = props.TableConfigProps

  if (myTable?.create?.label) {
    return (
      <div
        onClick={async e => {
          const allowNextProcess = myTable?.create?.onClick ? await myTable?.create?.onClick?.() : true
          if (allowNextProcess) {
            setformData({id: 0})
          }
        }}
      >
        {myTable?.create?.label ? myTable?.create?.label : <></>}
      </div>
    )
  }
  return (
    <>
      {myTable?.['create'] !== false && (
        <Button
          {...{
            size: `sm`,
            type: `button`,
            onClick: async e => {
              const allowNextProcess = myTable?.create?.onClick ? await myTable?.create?.onClick?.() : true
              if (allowNextProcess) {
                setformData({id: 0})
              }
            },
          }}
        >
          新規
        </Button>
      )}
    </>
  )
}
