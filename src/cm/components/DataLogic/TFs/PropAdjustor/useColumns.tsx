import {colType} from '@cm/types/types'
import {dynamicMasterModel} from '@class/builders/ColBuilderVariables'
import {PrismaModelNames} from '@cm/types/prisma-types'

// 型定義を追加
interface UseColumnsProps {
  useGlobalProps: any
  HK_USE_RECORDS: any
  dataModelName: PrismaModelNames
  ColBuilder?: any
  ColBuilderExtraProps?: any
}

// columnGetMethod取得を分離
const getColumnGetMethod = (ColBuilder: any, dataModelName: PrismaModelNames) => {
  return ColBuilder?.[dataModelName] ?? ColBuilder?.['dynamicMasterModel'] ?? dynamicMasterModel
}

export const useColumns = ({
  useGlobalProps,
  HK_USE_RECORDS,
  dataModelName,
  ColBuilder,
  ColBuilderExtraProps,
}: UseColumnsProps): colType[][] => {
  // ✅ 重い計算処理なのでメモ化有効
  const columnGetMethod = getColumnGetMethod(ColBuilder, dataModelName)

  return columnGetMethod({
    useGlobalProps,
    ColBuilderExtraProps: {...ColBuilderExtraProps, HK_USE_RECORDS},
    transposeColumnsOptions: {},
    dataModelName,
  })
}

export default useColumns
