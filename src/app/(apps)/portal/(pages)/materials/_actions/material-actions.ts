'use server'

import prisma from 'src/lib/prisma'
import {RawMaterial, StockAdjustment} from '@prisma/client'

export type RawMaterialWithStock = RawMaterial & {
  currentStock?: number
  isAlert?: boolean
}

// --- Create ---
export const createRawMaterial = async (data: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => {
  try {
    const material = await prisma.rawMaterial.create({
      data,
    })
    return {success: true, data: material}
  } catch (error) {
    console.error('原材料の作成に失敗しました:', error)
    return {success: false, error: '原材料の作成に失敗しました'}
  }
}

// --- Read ---
export const getAllRawMaterials = async () => {
  try {
    const materials = await prisma.rawMaterial.findMany({
      orderBy: [{createdAt: 'asc'}, {sortOrder: 'asc'}],
    })
    return {success: true, data: materials}
  } catch (error) {
    console.error('原材料の取得に失敗しました:', error)
    return {success: false, error: '原材料の取得に失敗しました', data: []}
  }
}

export const getRawMaterialById = async (id: number) => {
  try {
    const material = await prisma.rawMaterial.findUnique({
      where: {id},
      include: {
        ProductRecipe: {
          include: {
            Product: true,
          },
        },
        StockAdjustment: {
          orderBy: {adjustmentAt: 'desc'},
        },
      },
    })
    return {success: true, data: material}
  } catch (error) {
    console.error('原材料の取得に失敗しました:', error)
    return {success: false, error: '原材料の取得に失敗しました', data: null}
  }
}

// --- Update ---
export const updateRawMaterial = async (id: number, data: Partial<RawMaterial>) => {
  try {
    const material = await prisma.rawMaterial.update({
      where: {id},
      data,
    })
    return {success: true, data: material}
  } catch (error) {
    console.error('原材料の更新に失敗しました:', error)
    return {success: false, error: '原材料の更新に失敗しました'}
  }
}

// --- Delete ---
export const deleteRawMaterial = async (id: number) => {
  try {
    await prisma.rawMaterial.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('原材料の削除に失敗しました:', error)
    return {success: false, error: '原材料の削除に失敗しました'}
  }
}

// --- Stock Adjustments ---
export const createStockAdjustment = async (data: Omit<StockAdjustment, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => {
  try {
    const adjustment = await prisma.stockAdjustment.create({
      data,
    })
    return {success: true, data: adjustment}
  } catch (error) {
    console.error('在庫調整の作成に失敗しました:', error)
    return {success: false, error: '在庫調整の作成に失敗しました'}
  }
}

export const getStockAdjustmentsByMaterial = async (rawMaterialId: number) => {
  try {
    const adjustments = await prisma.stockAdjustment.findMany({
      where: {rawMaterialId},
      orderBy: {adjustmentAt: 'desc'},
    })
    return {success: true, data: adjustments}
  } catch (error) {
    console.error('在庫調整履歴の取得に失敗しました:', error)
    return {success: false, error: '在庫調整履歴の取得に失敗しました', data: []}
  }
}

export const deleteStockAdjustment = async (id: number) => {
  try {
    await prisma.stockAdjustment.delete({
      where: {id},
    })
    return {success: true}
  } catch (error) {
    console.error('在庫調整の削除に失敗しました:', error)
    return {success: false, error: '在庫調整の削除に失敗しました'}
  }
}

// 原材料の現在庫計算
export const calculateCurrentStock = async (rawMaterialId: number) => {
  try {
    // 在庫調整の合計
    const adjustments = await prisma.stockAdjustment.findMany({
      where: {rawMaterialId},
    })
    const totalAdjusted = adjustments.reduce((sum, adj) => sum + adj.quantity, 0)

    // 生産による消費（国産のみ）
    const productions = await prisma.production.findMany({
      where: {type: '国産'},
      include: {
        Product: {
          include: {
            ProductRecipe: {
              where: {rawMaterialId},
            },
          },
        },
      },
    })

    const totalUsed = productions.reduce((sum, prod) => {
      const recipe = prod.Product.ProductRecipe.find(r => r.rawMaterialId === rawMaterialId)
      return sum + (recipe ? recipe.amount * prod.quantity : 0)
    }, 0)

    return {success: true, currentStock: totalAdjusted - totalUsed, totalAdjusted, totalUsed}
  } catch (error) {
    console.error('在庫計算に失敗しました:', error)
    return {success: false, error: '在庫計算に失敗しました', currentStock: 0, totalAdjusted: 0, totalUsed: 0}
  }
}
