export type RoleStr = `管理者` | `部長` | `役員` | `発注担当者` | `工場長`

const PURCHASE_TYPE_OPTIONS: {value: string; label: string; color?: string; shinseisha: RoleStr[]; nextApprover: RoleStr[]}[] = [
  {
    value: `リピート`,
    label: `リピート`,
    color: '#4CAF50',
    shinseisha: [],
    nextApprover: [`発注担当者`],
  },
  {
    value: `新規`,
    label: `新規`,
    color: '#2196F3',
    shinseisha: [],
    nextApprover: [`工場長`, '発注担当者'],
  },
  {
    value: `再研磨`,
    label: `再研磨`,
    color: '#9C27B0',
    shinseisha: [`工場長`],
    nextApprover: [`発注担当者`],
  },
  {
    value: `折損・トラブル`,
    label: `折損・トラブル`,
    color: '#FF9800',
    shinseisha: [],
    nextApprover: [`工場長`, '発注担当者'],
  },
]

const APPROVAL_STATUS_OPTIONS = [
  {value: `承認`, label: `承認`, color: `#459d48`},
  {value: `却下`, label: `却下`, color: `#f84141`},
  {value: `未回答`, label: `未回答`, color: `#9E9E9E`},
]
const ROLE_OPTIONS: {value: RoleStr; label: string; color?: string}[] = [
  {value: `管理者`, label: `管理者`},
  {value: `部長`, label: `部長`},
  {value: `役員`, label: `役員`},
  {value: `発注担当者`, label: `発注担当者`},
  {value: `工場長`, label: `工場長`},
]
const LEAVE_TYPE_OPTION: {value: string; label: string; color?: string}[] = [
  {value: `1日`, label: `1日`},
  {value: `午前休`, label: `午前休`},
  {value: `午後休`, label: `午後休`},
  {value: `特別休暇`, label: `特別休暇`},
  {value: `慶弔休暇`, label: `慶弔休暇`},
  {value: `産前産後休暇`, label: `産前産後休暇`},
  {value: `代休`, label: `代休`},
  {value: `欠勤`, label: `欠勤`},
  {value: `早退`, label: `早退`},
  {value: `遅刻`, label: `遅刻`},
  {value: `キャンセル`, label: `キャンセル`},
]

export const CODE_MASTER = {
  PURCHASE_TYPE_OPTIONS,
  APPROVAL_STATUS_OPTIONS,
  ROLE_OPTIONS,
  LEAVE_TYPE_OPTION,
}
