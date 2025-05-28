export const transformTbmOperationData = formData => {
  const operations = formData?.TbmOperation
  if (!operations?.length) return null

  // 最初のオペレーションからグループ共通の情報を取得
  const firstOperation = operations[0]

  const transformed = {
    ...formData,
    // 行きの情報
    go_date: operations.find(op => op.type === 'go')?.date || null,
    go_tbmRouteGroupId: operations.find(op => op.type === 'go')?.tbmRouteGroupId || null,
    go_distanceKm: operations.find(op => op.type === 'go')?.distanceKm || null,

    // 帰りの情報
    back_date: operations.find(op => op.type === 'back')?.date || null,
    back_tbmRouteGroupId: operations.find(op => op.type === 'back')?.tbmRouteGroupId || null,
    back_distanceKm: operations.find(op => op.type === 'back')?.distanceKm || null,
  }

  return transformed
}
