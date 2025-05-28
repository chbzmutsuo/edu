import TableConfig from 'src/cm/components/DataLogic/TFs/MyTable/TableConfig'
import {IconBtn} from 'src/cm/components/styles/common-components/IconBtn'
import MyPopover from 'src/cm/components/utils/popover/MyPopover'
import {Cog8ToothIcon} from '@heroicons/react/20/solid'
import React from 'react'

export default function PopoverConfig({TableConfigProps, ClientProps2}) {
  return (
    <MyPopover
      {...{
        mode: `click`,
        offsets: {x: 5, y: 5},
        button: (
          <IconBtn className={`mx-auto h-8 w-8 rounded-full`}>
            <Cog8ToothIcon className="onHover  text-center  text-gray-500" />
          </IconBtn>
        ),
      }}
    >
      <div className={`rounded-lg bg-gray-200 p-4 shadow-md `}>
        <TableConfig {...{TableConfigProps, ClientProps2}} />
      </div>
    </MyPopover>
  )
}
