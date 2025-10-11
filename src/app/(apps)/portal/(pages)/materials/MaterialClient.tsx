'use client'

import React, {useState, useEffect} from 'react'
import {RawMaterial} from '@prisma/client'
import {PlusCircle} from 'lucide-react'
import useModal from '@cm/components/utils/modal/useModal'
import useGlobal from '@cm/hooks/globalHooks/useGlobal'
import {
  getAllRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  calculateCurrentStock,
} from './_actions/material-actions'
import MaterialForm from './_components/MaterialForm'
import MaterialTable from './_components/MaterialTable'
import StockHistoryModal from './_components/StockHistoryModal'

type MaterialClientProps = {
  initialMaterials: RawMaterialWithStock[]
}

export type RawMaterialWithStock = RawMaterial & {
  currentStock?: number
  isAlert?: boolean
}

const MaterialClient = ({initialMaterials}: MaterialClientProps) => {
  const {toggleLoad} = useGlobal()
  const [materials, setMaterials] = useState<RawMaterialWithStock[]>(initialMaterials)
  const [loading, setLoading] = useState(false)

  const EditModalReturn = useModal<{material?: RawMaterial}>()
  const HistoryModalReturn = useModal<{material: RawMaterial}>()

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    setLoading(true)
    try {
      const {data} = await getAllRawMaterials()
      if (data) {
        // 各原材料の在庫を計算
        const materialsWithStock = await Promise.all(
          data.map(async material => {
            const {currentStock} = await calculateCurrentStock(material.id)
            return {
              ...material,
              currentStock,
              isAlert: currentStock < material.safetyStock,
            }
          })
        )
        setMaterials(materialsWithStock)
      }
    } catch (error) {
      console.error('原材料の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (materialData: Partial<RawMaterial>) => {
    const editingMaterial = EditModalReturn?.open?.material

    await toggleLoad(async () => {
      if (editingMaterial) {
        const result = await updateRawMaterial(editingMaterial.id, materialData)
        if (result.success) {
          await loadMaterials()
          EditModalReturn.handleClose()
        } else {
          alert(result.error || '更新に失敗しました')
        }
      } else {
        const result = await createRawMaterial(materialData as any)
        if (result.success) {
          await loadMaterials()
          EditModalReturn.handleClose()
        } else {
          alert(result.error || '作成に失敗しました')
        }
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (confirm('この原材料を削除してもよろしいですか？')) {
      await toggleLoad(async () => {
        const result = await deleteRawMaterial(id)
        if (result.success) {
          await loadMaterials()
        } else {
          alert(result.error || '削除に失敗しました')
        }
      })
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">原材料マスター</h1>
        <button
          onClick={() => EditModalReturn.handleOpen({})}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          新規登録
        </button>
      </div>

      {/* テーブル */}
      <MaterialTable
        materials={materials}
        loading={loading}
        onEdit={material => EditModalReturn.handleOpen({material})}
        onDelete={handleDelete}
        onHistory={material => HistoryModalReturn.handleOpen({material})}
      />

      {/* 編集モーダル */}
      <EditModalReturn.Modal title={EditModalReturn.open?.material ? '原材料編集' : '原材料登録'}>
        <MaterialForm material={EditModalReturn.open?.material} onSave={handleSave} onCancel={EditModalReturn.handleClose} />
      </EditModalReturn.Modal>

      {/* 在庫履歴モーダル */}
      {HistoryModalReturn.open?.material && (
        <HistoryModalReturn.Modal title={`在庫増減履歴: ${HistoryModalReturn.open.material.name}`}>
          <StockHistoryModal
            material={HistoryModalReturn.open.material}
            onClose={HistoryModalReturn.handleClose}
            onRefresh={loadMaterials}
          />
        </HistoryModalReturn.Modal>
      )}
    </div>
  )
}

export default MaterialClient
