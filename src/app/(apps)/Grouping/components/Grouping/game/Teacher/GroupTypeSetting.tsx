import React from 'react'

import {useGroupReturnObjType} from '@app/(apps)/Grouping/components/Grouping/game/Teacher/useGroups/useGroups'
import {useGroupSettingFormReturnType} from '@app/(apps)/Grouping/components/Grouping/game/Teacher/useGroups/useGroupSettingForm'

import {Button} from '@components/styles/common-components/Button'
import {C_Stack} from '@components/styles/common-components/common-components'

export const GroupTypeSetting = React.memo(
  (props: {groupSettingFormHook: useGroupSettingFormReturnType; useGroupReturnObj: useGroupReturnObjType; Game}) => {
    const {groupSettingFormHook, useGroupReturnObj, Game} = props
    const {handleCreateGroup} = useGroupReturnObj

    const rolesHaveBeenSet = Game.LearningRoleMasterOnGame?.length > 0
    const studentsAreAnswering = Game.status === `アンケート実施`

    return (
      <C_Stack className={` mx-auto w-fit`}>
        <groupSettingFormHook.GroupConfigForm
          latestFormData={groupSettingFormHook.groupConfigFormValues}
          ControlOptions={{ControlStyle: {width: 270}}}
          onSubmit={data => {
            if (!rolesHaveBeenSet) {
              return alert('グループを作成するには、役割を設定してください。')
            }
            if (studentsAreAnswering) {
              return alert('グループを作成するには、アンケートを終了してください。')
            }

            handleCreateGroup({prompt: {}, groupConfig: data})
          }}
        >
          <Button>グループ作成</Button>
        </groupSettingFormHook.GroupConfigForm>
      </C_Stack>
    )
  }
)
