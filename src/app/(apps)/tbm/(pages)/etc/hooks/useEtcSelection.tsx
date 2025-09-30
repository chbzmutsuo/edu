import {useState, useMemo} from 'react'

export const useEtcSelection = (etcRawData: EtcRecord[]) => {
  // 選択状態を管理
  const [selectedRows, setSelectedRows] = useState<{[key: number]: boolean}>({})

  const toggleRowSelection = (id: number) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const selectedRecords = useMemo(() => {
    return etcRawData.filter(row => selectedRows[row.id])
  }, [etcRawData, selectedRows])

  const clearSelection = () => {
    setSelectedRows({})
  }

  return {
    selectedRows,
    toggleRowSelection,
    selectedRecords,
    clearSelection,
  }
}
