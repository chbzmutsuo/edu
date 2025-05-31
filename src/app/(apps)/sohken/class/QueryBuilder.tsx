import {includeProps, roopMakeRelationalInclude} from '@cm/class/builders/QueryBuilderVariables'
import {Prisma} from '@prisma/client'
export const genbaDayMidTableSortOrder: Prisma.GenbaDayTaskMidTableOrderByWithRelationInput[] = [{sortOrder: 'asc'}, {id: 'asc'}]
export class QueryBuilder {
  static getInclude = (includeProps: includeProps) => {
    const user = {
      include: {
        SohkenCar: {},
        UserRole: {
          include: {RoleMaster: {}},
        },
      },
    }
    const sohkenCar = {
      include: {
        User: {},
      },
    }

    const genbaDay: Prisma.GenbaDayFindManyArgs = {
      include: {
        Genba: {
          include: {
            PrefCity: {},
            GenbaDay: {
              include: {
                GenbaDayTaskMidTable: {
                  include: {GenbaTask: {}},
                  orderBy: genbaDayMidTableSortOrder,
                },
              },
              orderBy: {date: 'asc'},
            },
            GenbaTask: {},
            GenbaDayShift: {
              include: {
                GenbaDay: {
                  include: {
                    GenbaDayTaskMidTable: {
                      orderBy: genbaDayMidTableSortOrder,
                    },
                  },
                },
              },
            },
          },
        },

        GenbaDayShift: {
          include: {
            GenbaDay: {},
            User: user,
          },
        },
        GenbaDaySoukenCar: {
          include: {SohkenCar: {}},
        },
        GenbaDayTaskMidTable: {
          orderBy: genbaDayMidTableSortOrder,
          include: {GenbaTask: {}},
        },
      },
    }
    const genba: Prisma.GenbaFindManyArgs = {
      include: {
        GenbaDay: {select: {id: true}},
        GenbaTask: {},
        PrefCity: {},
      },
    }
    // const userRole: Prisma.UserRoleFindManyArgs = {include: {RoleMaster: {}}}

    const include = {genbaDay, user, sohkenCar, genba}

    Object.keys(include).forEach(key => {
      roopMakeRelationalInclude({
        parentName: key,
        parentObj: include[key],
      })
    })

    return include
  }
}
