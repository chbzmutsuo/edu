import {forSelectConfig} from '@cm/types/select-types'
import {TbmRouteGroup} from '@prisma/client'

export class RouteGroupCl {
  tbmRouteGroup: TbmRouteGroup

  constructor(tbmRouteGroup: TbmRouteGroup) {
    this.tbmRouteGroup = tbmRouteGroup
  }

  get name() {
    const op = this.tbmRouteGroup
    return [
      //
      `[${op.id}]`,
      op.name,
      op.routeName && `\n(${op.routeName})`,
    ].join(` `)
  }

  get shortName() {
    const {name} = this.tbmRouteGroup
    return name
  }
  static getRouteGroupForSelectConfig = ({tbmBaseId}: {tbmBaseId?: number}) => {
    const result: forSelectConfig = {
      select: {id: true, name: true, routeName: true},
      where: {tbmBaseId},
      orderBy: [{id: 'asc'}],
      nameChanger(op) {
        if (op) {
          const routeGroup = op as unknown as TbmRouteGroup
          return {
            ...op,
            name: new RouteGroupCl(routeGroup).name,
          }
        }
        return op
      },
    }

    return result
  }
}
