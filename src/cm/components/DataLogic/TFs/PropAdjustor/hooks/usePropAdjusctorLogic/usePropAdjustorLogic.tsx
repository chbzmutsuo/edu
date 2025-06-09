import {useMemo} from 'react'

import {useMergeWithCustomViewParams} from '@components/DataLogic/TFs/PropAdjustor/hooks/usePropAdjusctorLogic/useMergeWithCustomViewParams'
import useColumns from '@components/DataLogic/TFs/PropAdjustor/hooks/usePropAdjusctorLogic/useColumns'
import useRecords, {UseRecordsReturn} from '@components/DataLogic/TFs/PropAdjustor/hooks/useRecords/useRecords'
import useInitFormState from '@hooks/useInitFormState'
import useEditForm from '@components/DataLogic/TFs/PropAdjustor/hooks/usePropAdjusctorLogic/useEditForm'
import useMyTable from '@components/DataLogic/TFs/PropAdjustor/hooks/usePropAdjusctorLogic/useMyTable'
import useAdditional from '@components/DataLogic/TFs/PropAdjustor/hooks/usePropAdjusctorLogic/useAdditional'
import useGlobal from '@hooks/globalHooks/useGlobal'

import {ClientPropsType2, UsePropAdjustorLogicProps} from '@components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

// usePropAdjustorLogic
export const usePropAdjustorLogic = ({
  ClientProps,
  serverFetchProps,
  initialModelRecords,
  fetchTime,
}: UsePropAdjustorLogicProps) => {
  const useGlobalProps = useGlobal()

  const UseRecordsReturn: UseRecordsReturn = useRecords({
    serverFetchProps,
    initialModelRecords,
    fetchTime,
  })

  const {prismaDataExtractionQuery, easySearchPrismaDataOnServer} = UseRecordsReturn
  const modelData = useMemo(() => UseRecordsReturn?.records?.[0], [UseRecordsReturn?.records])
  const {formData, setformData} = useInitFormState(null, [modelData])

  const columns = useColumns({
    useGlobalProps,
    UseRecordsReturn,
    dataModelName: ClientProps.dataModelName,
    ColBuilder: ClientProps.ColBuilder,
    ColBuilderExtraProps: ClientProps.ColBuilderExtraProps,
  })

  const additional = useAdditional({
    additional: ClientProps.additional,
    prismaDataExtractionQuery,
  })

  const EditForm = useEditForm({
    PageBuilderGetter: ClientProps.PageBuilderGetter,
    PageBuilder: ClientProps.PageBuilder,
    dataModelName: ClientProps.dataModelName,
  })

  const myTable = useMyTable({
    columns,
    displayStyle: ClientProps.displayStyle,
    myTable: ClientProps.myTable,
  })

  const ClientProps2: ClientPropsType2 = useMergeWithCustomViewParams({
    ...ClientProps,
    ...UseRecordsReturn,
    additional,
    EditForm,
    myTable,
    useGlobalProps,
    columns,
    formData,
    setformData,
    UseRecordsReturn,
    prismaDataExtractionQuery,
  })

  return {
    ClientProps2,
    UseRecordsReturn,
    modelData,
    easySearchPrismaDataOnServer,
    useGlobalProps,
  }
}
