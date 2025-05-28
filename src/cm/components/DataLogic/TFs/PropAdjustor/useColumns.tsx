import {colType} from '@cm/types/types'
import {dynamicMasterModel} from '@class/builders/ColBuilderVariables'
import {PrismaModelNames} from '@cm/types/prisma-types'
import {columnGetterType} from '@cm/types/types'

export const useColumns = ({useGlobalProps, HK_USE_RECORDS, dataModelName, ColBuilder, ColBuilderExtraProps}) => {
  const columnGetMethod: (props: columnGetterType & {dataModelName: PrismaModelNames}) => colType[][] =
    ColBuilder?.[dataModelName] ?? ColBuilder?.['dynamicMasterModel'] ?? dynamicMasterModel

  const columns = columnGetMethod({
    useGlobalProps,
    ColBuilderExtraProps: {...ColBuilderExtraProps, HK_USE_RECORDS},
    transposeColumnsOptions: {},
    dataModelName,
  })

  return columns
}

export default useColumns
