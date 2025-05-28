import GroupViewer from '@app/(apps)/Grouping/components/Grouping/game/Teacher/GroupHandler/GroupViewer/GroupViewer'

const ActiveGroupViwer = ({GameCtxValue}) => {
  const {Game, GAME_CLASS, activeGroupsWithRoles} = GameCtxValue

  const GroupArrInRoom = Game.Group
  // const GroupArrInRoom = Game.Room.Game.map(g => g.Group).flat()

  const activeGroup = [...Game?.Group, ...GroupArrInRoom]?.find(g => {
    return g.id === Game.activeGroupId
  })

  const groupsWithRoles = activeGroupsWithRoles

  return (
    <div className={`mx-auto`}>
      <div className={`row-stack`}>
        <small>現在適用中のグループ構成: </small>
        <h2>{activeGroup?.name}</h2>
      </div>
      {!activeGroup && (
        <div className={`t-alert text-error-main h-full text-start`}>
          グループが選択されていません。 <br />
          アンケート結果から、自動グルーピングを適応してください。
        </div>
      )}

      {activeGroup && <GroupViewer GameCtxValue={GameCtxValue} groupsWithRoles={groupsWithRoles} />}
    </div>
  )
}

export default ActiveGroupViwer
