import {includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'

export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const kaizenWork = {
      include: {
        KaizenWorkImage: {},
        KaizenClient: {
          include: {
            KaizenWork: {},
          },
        },
      },
    }
    const include = {kaizenWork}

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}
