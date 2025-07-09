import React, {useState} from 'react'

import BasicModal from '@cm/components/utils/modal/BasicModal'
import GroupViewer from '@app/(apps)/Grouping/components/Grouping/game/Teacher/GroupHandler/GroupViewer/GroupViewer'
import {R_Stack} from '@components/styles/common-components/common-components'
export const GroupConfirmationModalOrigin = ({
  groups,
  setgroups,
  initialGroupName,
  setinitialGroupName,
  confirmGroup,
  GameCtxValue,
}) => {
  return (
    <>
      {groups && (
        <BasicModal open={groups} setopen={setgroups}>
          <div className={`col-stack t-paper my-2 flex-wrap text-center`}>
            <div className={`row-stack mx-auto  flex-nowrap  `}></div>
            <R_Stack>
              <Control {...{initialGroupName, setinitialGroupName}} />
              <button className={`t-btn bg-primary-main `} onClick={confirmGroup} disabled={!initialGroupName}>
                グループ確定
              </button>
            </R_Stack>
          </div>
          <div className={`mx-auto`}>
            {/* //グループ内亜訳 */}
            <GroupViewer
              {...{
                editable: {
                  groups,
                  setgroups,
                },
                GameCtxValue,
                groupsWithRoles: groups,
              }}
            />
          </div>
        </BasicModal>
      )}
    </>
  )
}

const Control = props => {
  const [value, setvalue] = useState(props.initialGroupName)
  return (
    <>
      <label>グループ名</label>
      <input
        value={value}
        onChange={e => setvalue(e.target.value)}
        className={`myFormControl  w-[180px]`}
        onBlur={e => props.setinitialGroupName(e.target.value)}
      />
    </>
  )
}
