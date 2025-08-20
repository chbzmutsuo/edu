import EtcConnectForm from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/EtcConnector/EtcConnectForm'
import EtcConnectHistoryTable from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/EtcConnector/EtcConnectHistoryTable'
import {Button} from '@cm/components/styles/common-components/Button'
import {C_Stack, FitMargin} from '@cm/components/styles/common-components/common-components'
import BasicModal from '@cm/components/utils/modal/BasicModal'
import useModal from '@cm/components/utils/modal/useModal'
import React from 'react'

export default function EtcConnetor({useGlobalProps, tbmVehicleId}) {
  const {session, query} = useGlobalProps

  const EtcConnectFormMD = useModal()

  return (
    <>
      <FitMargin>
        <C_Stack className={` items-center`}>
          <Button color="blue" onClick={EtcConnectFormMD.handleOpen}>
            連携設定
          </Button>

          <EtcConnectFormMD.Modal>
            <EtcConnectForm {...{EtcConnectFormMD}} />
          </EtcConnectFormMD.Modal>
          {/* <div className={`text-gray-500`}>ETC利用明細スプレッドシートに所定の設定をしてからじｓ</div> */}
          <EtcConnectHistoryTable {...{tbmVehicleId}} />
        </C_Stack>
      </FitMargin>
    </>
  )
}
