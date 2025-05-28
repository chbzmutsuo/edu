export const GENBA_DAY_STATUS: {
  label: string
  color: string
  finishFlag: boolean
}[] = [
  {label: '未完了', color: 'red', finishFlag: false},
  {label: '不要', color: 'gray', finishFlag: false},
  {label: '済', color: 'blue', finishFlag: true},
  {label: '完了', color: 'green', finishFlag: true},
]
