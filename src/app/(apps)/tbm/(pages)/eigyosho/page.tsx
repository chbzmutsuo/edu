import {getEigyoshoUriageData} from '@app/(apps)/tbm/(server-actions)/getEigyoshoUriageData'
import {FitMargin} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
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

  const {EigyoshoUriageRecords} = await getEigyoshoUriageData({whereQuery, tbmBaseId})

  return (
    <FitMargin className={`pt-4`}>
      <NewDateSwitcher {...{monthOnly: true}} />
      {CsvTable({
        records: EigyoshoUriageRecords.map(item => {
          const {keyValue} = item
          return {csvTableRow: Object.keys(keyValue).map(key => item.keyValue[key])}
        }),
      }).WithWrapper({
        className: `text-sm max-w-[95vw] max-h-[80vh] t-paper`,
      })}
      {/* <NempiKanriCC {...{vehicleList, fuelByCarWithVehicle, lastRefuelHistoryByCar}} /> */}
    </FitMargin>
  )
}
