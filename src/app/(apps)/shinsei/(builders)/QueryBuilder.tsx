import {getIncludeType, includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const include: getIncludeType = {
      product: {
        include: {ShiireSaki: true},
      },
      user: {
        include: {UserRole: {include: {RoleMaster: {}}}, Department: true},
      },
    }

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}
