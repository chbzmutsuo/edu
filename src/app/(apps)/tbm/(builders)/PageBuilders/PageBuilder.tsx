'use client'

import {tbmOperationGroup} from '@app/(apps)/tbm/(builders)/PageBuilders/tbmOperationGroup/tbmOperationGroup'
import {useGlobalPropType} from '@hooks/globalHooks/useGlobal'
import {Fields} from '@class/Fields/Fields'
import GlobalIdSelector from '@components/GlobalIdSelector/GlobalIdSelector'
import TbmVehicleDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmVehicleDetail'
import TbmRouteGroupDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmRouteGroupDetail'
import TbmUserDetail from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/TbmUserDetail'

export class PageBuilder {
  // static tbmBase = tbmBase
  static tbmVehicle = {
    form: TbmVehicleDetail,
  }
  static tbmRouteGroup = {
    form: TbmRouteGroupDetail,
  }
  static user = {
    form: TbmUserDetail,
  }
  static tbmOperationGroup = tbmOperationGroup

  static getGlobalIdSelector = (props: {useGlobalProps: useGlobalPropType}) => {
    const {useGlobalProps} = props

    const {admin, getTbmScopes} = useGlobalProps.accessScopes()
    const {userId, tbmBaseId} = getTbmScopes()

    const columns = new Fields([
      {id: 'g_tbmBaseId', label: '営', forSelect: {}},
      // {id: 'g_userId', label: 'ド', forSelect: {}},
    ]).transposeColumns()

    if (admin) {
      return () => <GlobalIdSelector {...{useGlobalProps, columns}} />
    }
  }
}
