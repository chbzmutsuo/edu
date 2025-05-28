import {
  EasySearchObject,
  EasySearchObjectExclusiveGroup,
  easySearchType,
  Ex_exclusive0,
  makeEasySearchGroups,
  makeEasySearchGroupsProp,
  toRowGroup,
} from '@cm/class/builders/QueryBuilderVariables'
import {Prisma} from '@prisma/client'

export const tbmEasySearchBuilder = async () => {
  const tbmVehicle = async (props: easySearchType) => {
    type exclusiveKeyStrings =
      | 'jibaisekiManryobi'
      | 'jidoshaManryobi'
      | 'kamotsuManryobi'
      | 'sharyoManryobi'
      | 'etcCardExpiration'
      | `fuelCardExpiration`
    type CONDITION_TYPE = Prisma.TbmVehicleWhereInput
    type exclusiveGroups = EasySearchObjectExclusiveGroup<exclusiveKeyStrings, CONDITION_TYPE>
    const {session, query, dataModelName, easySearchExtraProps} = props
    const {whereQuery} = easySearchExtraProps ?? {}

    type keys = {
      [key in string]: EasySearchObject
    }

    const oneMonthFromNow = new Date(new Date().setMonth(new Date().getMonth() + 1))

    const Ex_exclusive1: exclusiveGroups = {
      jibaisekiManryobi: {
        label: `自賠責`,
        CONDITION: {
          jibaisekiManryobi: {lte: oneMonthFromNow},
        },
      },
      jidoshaManryobi: {
        label: `自動車保険`,
        CONDITION: {
          jidoshaManryobi: {lte: oneMonthFromNow},
        },
      },
      kamotsuManryobi: {
        label: `貨物保険`,
        CONDITION: {
          kamotsuManryobi: {lte: oneMonthFromNow},
        },
      },
      sharyoManryobi: {
        label: `車両保険`,
        CONDITION: {
          sharyoManryobi: {lte: oneMonthFromNow},
        },
      },
      etcCardExpiration: {
        label: `ETCカード`,
        CONDITION: {
          etcCardExpiration: {lte: oneMonthFromNow},
        },
      },
      fuelCardExpiration: {
        label: `燃料カード`,
        CONDITION: {
          TbmFuelCard: {
            some: {
              date: {lte: oneMonthFromNow},
            },
          },
        },
      },
    }

    const dataArr: makeEasySearchGroupsProp[] = []
    toRowGroup(1, dataArr, [
      //
      {exclusiveGroup: Ex_exclusive0, name: `全て`, additionalProps: {refresh: true}},
      {exclusiveGroup: Ex_exclusive1, name: `期限切れ1ヶ月以内`, additionalProps: {refresh: true}},
    ])
    const result = makeEasySearchGroups(dataArr) as keys

    return result
  }

  return {
    tbmVehicle,
  }
}
