'use server'

import prisma from 'src/lib/prisma'

export type HistoryFilterType = {
  startDate?: string
  endDate?: string
  changeType?: string
  changedBy?: string
  keyword?: string
}

// 変更履歴を取得する関数
export const getReservationHistories = async (filter: HistoryFilterType = {}) => {
  const where: any = {}

  // 日付範囲フィルター
  if (filter.startDate || filter.endDate) {
    where.changedAt = {}
    if (filter.startDate) {
      where.changedAt.gte = new Date(filter.startDate)
    }
    if (filter.endDate) {
      const endDate = new Date(filter.endDate)
      endDate.setHours(23, 59, 59, 999)
      where.changedAt.lte = endDate
    }
  }

  // 変更タイプフィルター
  if (filter.changeType) {
    where.changeType = filter.changeType
  }

  // 変更者フィルター
  if (filter.changedBy) {
    where.changedBy = {
      contains: filter.changedBy,
      mode: 'insensitive',
    }
  }

  // キーワード検索
  if (filter.keyword) {
    const keyword = filter.keyword

    // 予約IDが数値の場合は直接検索
    const reservationId = parseInt(keyword)
    if (!isNaN(reservationId)) {
      where.sbmReservationId = reservationId
    } else {
      // キーワードで検索（JSONフィールド内も検索）
      where.OR = [
        {changedBy: {contains: keyword, mode: 'insensitive'}},
        {oldValues: {path: ['customerName'], string_contains: keyword}},
        {newValues: {path: ['customerName'], string_contains: keyword}},
        {oldValues: {path: ['items'], array_contains: [{productName: {contains: keyword}}]}},
        {newValues: {path: ['items'], array_contains: [{productName: {contains: keyword}}]}},
      ]
    }
  }

  try {
    // 変更履歴を取得
    const histories = await prisma.sbmReservationChangeHistory.findMany({
      where,
      orderBy: {
        changedAt: 'desc',
      },
      take: 100, // 一度に取得する最大件数
    })

    // 関連する予約情報を取得
    const reservationIds = [...new Set(histories.map(h => h.sbmReservationId))]
    const reservations = await prisma.sbmReservation.findMany({
      where: {
        id: {
          in: reservationIds,
        },
      },
      select: {
        id: true,
        customerName: true,
      },
    })

    // 予約情報をマッピング
    const reservationMap = new Map(reservations.map(r => [r.id, r]))

    // レスポンス形式に変換
    return histories.map(h => ({
      id: h.id,
      sbmReservationId: h.sbmReservationId,
      customerName: reservationMap.get(h.sbmReservationId)?.customerName || '',
      changedBy: h.changedBy,
      changeType: h.changeType,
      changedFields: h.changedFields,
      oldValues: h.oldValues,
      newValues: h.newValues,
      changedAt: h.changedAt,
    }))
  } catch (error) {
    console.error('変更履歴取得エラー:', error)
    return []
  }
}

// 特定の予約の変更履歴を取得する関数
export const getReservationHistoryById = async (reservationId: number) => {
  try {
    const histories = await prisma.sbmReservationChangeHistory.findMany({
      where: {
        sbmReservationId: reservationId,
      },
      orderBy: {
        changedAt: 'desc',
      },
    })

    return histories.map(h => ({
      id: h.id,
      sbmReservationId: h.sbmReservationId,
      changedBy: h.changedBy,
      changeType: h.changeType,
      changedFields: h.changedFields,
      oldValues: h.oldValues,
      newValues: h.newValues,
      changedAt: h.changedAt,
    }))
  } catch (error) {
    console.error('変更履歴取得エラー:', error)
    return []
  }
}

// 変更履歴の統計情報を取得する関数
export const getHistoryStatistics = async (period: 'day' | 'week' | 'month' = 'week') => {
  try {
    // 期間の開始日を計算
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    // 変更タイプごとの集計
    const changeTypeCounts = await prisma.$queryRaw`
      SELECT
        "changeType",
        COUNT(*) as count
      FROM
        "SbmReservationChangeHistory"
      WHERE
        "changedAt" >= ${startDate}
      GROUP BY
        "changeType"
    `

    // 変更者ごとの集計
    const userChangeCounts = await prisma.$queryRaw`
      SELECT
        "changedBy",
        COUNT(*) as count
      FROM
        "SbmReservationChangeHistory"
      WHERE
        "changedAt" >= ${startDate}
      GROUP BY
        "changedBy"
      ORDER BY
        count DESC
      LIMIT 5
    `

    return {
      period,
      changeTypeCounts,
      userChangeCounts,
    }
  } catch (error) {
    console.error('変更履歴統計取得エラー:', error)
    return {
      period,
      changeTypeCounts: [],
      userChangeCounts: [],
    }
  }
}
