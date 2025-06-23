import {RoleSetting} from './RoleSetting'
import {GroupTypeSetting} from './GroupTypeSetting'
import Loader from '@cm/components/utils/loader/Loader'
import QuestionHandler from './QuestionHandler/QuestionHandler'
import {useMemo} from 'react'
import {GameContextType} from '@app/(apps)/Grouping/components/Grouping/game/GameMainPage'

import ActiveGroupViwer from '@app/(apps)/Grouping/components/Grouping/game/Teacher/ActiveGroupViwer'

import TeacherDispChartWrapper from '@app/(apps)/Grouping/components/Grouping/game/Chart/TeacherDispChartWrapper'

import Redirector from '@cm/components/utils/Redirector'
import {useDisplaySelector} from '@components/utils/tabs/displaySelector/useDisplaySelector'
import SelectedItems from '@app/(apps)/Grouping/components/Grouping/game/Teacher/SelectedItems'
import {DisplaySelector} from '@app/(apps)/Grouping/components/Grouping/game/Teacher/DisplaySelector'

import useGroups, {
  groupConfigMaster,
  useGroupReturnObjType,
} from '@app/(apps)/Grouping/components/Grouping/game/Teacher/useGroups/useGroups'

import useGroupSettingForm from '@app/(apps)/Grouping/components/Grouping/game/Teacher/useGroups/useGroupSettingForm'
import GameInformation from '@app/(apps)/Grouping/components/Grouping/game/GameInformation'
import {Paper} from '@components/styles/common-components/paper'
import {C_Stack, R_Stack, Vr} from '@components/styles/common-components/common-components'

export default function TeacherDisplay(props: {GameCtxValue: GameContextType}) {
  const {GameCtxValue} = props
  const {useGlobalProps} = GameCtxValue
  const {accessScopes, width} = useGlobalProps
  const {teacherId} = accessScopes().getGroupieScopes()

  const {Game} = props.GameCtxValue

  const groupSettingFormHook = useGroupSettingForm({
    Game,
    groupConfigMaster,
    defaultCount: 4,
  })

  const useGroupReturnObj: useGroupReturnObjType = useGroups({GameCtxValue: props.GameCtxValue, groupSettingFormHook})

  const ActiveGroupViwerMemo = useMemo(() => <ActiveGroupViwer {...{GameCtxValue}} />, [Game])

  const leftWidth = 340
  const rightWidth = 280
  const centerWidth = width - rightWidth - leftWidth

  const {selectors, selectedComponents} = useDisplaySelector({
    items: getItems({centerWidth, ActiveGroupViwerMemo, GameCtxValue}),
  })

  const GroupTypeSettingMemo = useMemo(() => <GroupTypeSetting {...{groupSettingFormHook, useGroupReturnObj, Game}} />, [])

  const SettingMemo = (
    <C_Stack className={`gap-4`}>
      <section className={`text-center`}>
        <h2>表示項目選択</h2>
        <DisplaySelector {...{selectors}} />
      </section>
      <hr />
      <section className={`text-center`}>
        <div>
          <h2>役割設定</h2>

          <RoleSetting {...{Game, useGlobalProps}} />
        </div>
      </section>

      <hr />
      <section className={`text-center`}>
        <h2>グループ作成設定</h2>
        <div>{GroupTypeSettingMemo}</div>
      </section>

      <hr />
    </C_Stack>
  )

  if (teacherId !== Game.teacherId) return <Redirector redirectPath={'/404'} />
  if (!Game) return <Loader />

  const Modals = () => {
    return <>{useGroupReturnObj.GroupConfirmationModal}</>
  }

  return (
    <div className={`px-3`}>
      <Modals />
      <Paper className={` mx-auto  flex w-full justify-start`}>
        <GameInformation {...{GameCtxValue, useGroupReturnObj, groupConfig: groupSettingFormHook.groupConfigFormValues}} />
      </Paper>
      <Paper>
        <R_Stack className={`mx-auto flex-row  flex-nowrap items-stretch  gap-1 `}>
          <div style={{width: leftWidth}}>
            <QuestionHandler {...{useGroupReturnObj, GameCtxValue}} />
          </div>
          <Vr className={`mx-1 border-r-8  border-double border-gray-500 text-transparent `} />
          <div style={{width: centerWidth}}>
            <SelectedItems {...{selectedComponents}} />
          </div>
          <Vr className={`mx-1 border-r-8  border-double  border-gray-500 text-transparent `} />
          <div style={{width: rightWidth}}>{SettingMemo}</div>
        </R_Stack>
      </Paper>
    </div>
  )
}

function getItems({centerWidth, ActiveGroupViwerMemo, GameCtxValue}) {
  return [
    {defaultOpen: true, label: '適応中グループ', component: ActiveGroupViwerMemo},
    {defaultOpen: false, label: 'チャート', component: <TeacherDispChartWrapper {...{centerWidth, GameCtxValue}} />},
  ]
}
