import {SOHKEN_CONST} from '@app/(apps)/sohken/(constants)/SOHKEN_CONST'

export const genbaDaySorter = (a, b) => {
  if (a.date.getTime() === b.date.getTime()) {
    // 第一順位: PrefCityのsortOrder

    const aPrefCitySortOrder = a.Genba?.PrefCity?.sortOrder || 0
    const bPrefCitySortOrder = b.Genba?.PrefCity?.sortOrder || 0

    if (aPrefCitySortOrder !== bPrefCitySortOrder) {
      return aPrefCitySortOrder - bPrefCitySortOrder
    }

    // 第二順位: SOHKEN_CONST.OPTIONS.CONSTRUCTIONのインデックスで並び替え
    const aConstruction = a.Genba?.construction || ''
    const bConstruction = b.Genba?.construction || ''
    const constructionOptions = SOHKEN_CONST.OPTIONS.CONSTRUCTION
    const aIndex = constructionOptions.indexOf(aConstruction)
    const bIndex = constructionOptions.indexOf(bConstruction)

    // リストに存在しない値は最後に配置
    const aFinalIndex = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex
    const bFinalIndex = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex

    if (aFinalIndex !== bFinalIndex) {
      return aFinalIndex - bFinalIndex
    }

    // 第三順位: genbaDay.Genba.nameで並び替え
    const aGenbaid = a.Genba?.id || 0
    const bGenbaid = b.Genba?.id || 0
    return aGenbaid - bGenbaid
  }
  return a.date.getTime() < b.date.getTime() ? -1 : 1
}
