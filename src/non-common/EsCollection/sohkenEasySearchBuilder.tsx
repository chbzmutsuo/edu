import {
  EasySearchObjectExclusiveGroup,
  easySearchType,
  makeEasySearchGroups,
  makeEasySearchGroupsProp,
} from '@cm/class/builders/QueryBuilderVariables'

export const sohkenEasySearchBuilder = async () => {
  const genba = async (props: easySearchType) => {
    const {session, query, dataModelName, easySearchExtraProps} = props

    const exclusive1: EasySearchObjectExclusiveGroup = {
      notArchived: {label: `表示`, CONDITION: {archived: false}},
      archived: {label: `非表示`, CONDITION: {archived: true}},
    }

    const keyValuedExclusive1 = {}

    Object.keys(exclusive1).forEach(key => {
      const globalKey = `g_${key}`
      const content = exclusive1[key]
      keyValuedExclusive1[globalKey] = content
    })

    const dataArr: makeEasySearchGroupsProp[] = [
      // {exclusiveGroup: Ex_exclusive0, name: ``, additionalProps: {refresh: true}},
      {exclusiveGroup: keyValuedExclusive1, name: ``},
    ]

    const result = makeEasySearchGroups(dataArr)

    return result
  }
  return {
    genba,
  }
}
