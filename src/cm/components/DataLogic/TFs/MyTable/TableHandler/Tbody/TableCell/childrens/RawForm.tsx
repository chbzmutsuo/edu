import useEditableCell from 'src/cm/components/DataLogic/TFs/MyTable/TableHandler/Tbody/TableCell/lib/useEditableCell'

export default function EditableForm({col, record, dataModelName, mutateRecords}) {
  const {RawForm} = useEditableCell({
    col,
    record,
    dataModelName,
    mutateRecords,
  })
  return RawForm
}
