import UnkoMeisaiCC from '@app/(apps)/tbm/(pages)/unkomeisai/UnkoMeisaiCC'
import {getMonthlyTbmDriveData} from '@app/(apps)/tbm/(server-actions)/getMonthlyTbmDriveData'
import {getMidnight} from '@class/Days/date-utils/calculations'
import {FitMargin} from '@components/styles/common-components/common-components'
import NewDateSwitcher from '@components/utils/dates/DateSwitcher/NewDateSwitcher'
import Redirector from '@components/utils/Redirector'
import {dateSwitcherTemplate} from '@lib/methods/redirect-method'

import {initServerComopnent} from 'src/non-common/serverSideFunction'

export default async function DynamicMasterPage(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})
  const {tbmBaseId} = scopes.getTbmScopes()
  const {redirectPath, whereQuery} = await dateSwitcherTemplate({query})
  if (redirectPath) return <Redirector {...{redirectPath}} />
  const theDate = whereQuery?.gte ?? getMidnight()
  const {monthlyTbmDriveList, ConfigForMonth} = await getMonthlyTbmDriveData({whereQuery, tbmBaseId})

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{monthOnly: true}} />

      <UnkoMeisaiCC {...{monthlyTbmDriveList}} />
    </FitMargin>
  )
}
