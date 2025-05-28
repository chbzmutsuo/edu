import {additionalPropsType} from '@cm/types/types'

export default function useAdditional({additional, prismaDataExtractionQuery}) {
  additional.include = {...additional.include, ...prismaDataExtractionQuery.include}

  return additional as additionalPropsType
}
