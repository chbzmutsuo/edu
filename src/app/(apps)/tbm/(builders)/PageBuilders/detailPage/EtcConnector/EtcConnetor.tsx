import EtcConnectForm from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/EtcConnector/EtcConnectForm'
import EtcConnectHistoryTable from '@app/(apps)/tbm/(builders)/PageBuilders/detailPage/EtcConnector/EtcConnectHistoryTable'
import {Button} from '@components/styles/common-components/Button'
import BasicModal from '@components/utils/modal/BasicModal'
import React from 'react'

export default function EtcConnetor({useGlobalProps, tbmVehicleId}) {
  const {session, query} = useGlobalProps

  return (
    <>
      <BasicModal {...{toggle: <Button>連携</Button>}}>
        <EtcConnectForm />
      </BasicModal>
      <EtcConnectHistoryTable {...{tbmVehicleId}} />
    </>
  )
}
