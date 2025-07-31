'use server'

import {revalidatePath} from 'next/cache'
import prisma from 'src/lib/prisma'
import {Customer, Product, User, Reservation, ReservationFilter, DashboardStats, RFMCustomer, DeliveryTeam} from '../types'
import {RFM_SCORE_CRITERIA} from '../(constants)'

// データ取得アクション
export async function getAllCustomers(): Promise<Customer[]> {
  const customers = await prisma.sbmCustomer.findMany({
    orderBy: {createdAt: 'desc'},
  })

  return customers.map(c => ({
    id: c.id,
    companyName: c.companyName,
    contactName: c.contactName || '',
    phoneNumber: c.phoneNumber,
    deliveryAddress: c.deliveryAddress,
    postalCode: c.postalCode || '',
    email: c.email || '',
    availablePoints: c.availablePoints,
    notes: c.notes || '',
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.sbmProduct.findMany({
    where: {isActive: true},
    include: {
      priceHistory: {
        orderBy: {effectiveDate: 'desc'},
        take: 5,
      },
    },
    orderBy: {name: 'asc'},
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    currentPrice: p.currentPrice,
    currentCost: p.currentCost,
    category: p.category,
    isActive: p.isActive,
    priceHistory: p.priceHistory.map(h => ({
      id: h.id,
      price: h.price,
      cost: h.cost,
      effectiveDate: h.effectiveDate,
      createdAt: h.createdAt,
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))
}

export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.sbmUser.findMany({
    where: {isActive: true},
    orderBy: {name: 'asc'},
  })

  return users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    role: u.role as 'admin' | 'manager' | 'staff',
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }))
}

export async function getAllTeams(): Promise<DeliveryTeam[]> {
  const teams = await prisma.sbmDeliveryTeam.findMany({
    where: {isActive: true},
    orderBy: {name: 'asc'},
  })

  return teams.map(t => ({
    id: t.id,
    name: t.name,
    driverName: t.driverName,
    vehicleInfo: t.vehicleInfo || '',
    capacity: t.capacity,
    isActive: t.isActive,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }))
}

export async function getReservations(filter: ReservationFilter = {}): Promise<Reservation[]> {
  const where: any = {}

  // 日付範囲フィルター
  if (filter.startDate || filter.endDate) {
    where.deliveryDate = {}
    if (filter.startDate) {
      where.deliveryDate.gte = new Date(filter.startDate)
    }
    if (filter.endDate) {
      const endDate = new Date(filter.endDate)
      endDate.setHours(23, 59, 59, 999)
      where.deliveryDate.lte = endDate
    }
  }

  // キーワード検索
  if (filter.keyword) {
    where.OR = [
      {customerName: {contains: filter.keyword, mode: 'insensitive'}},
      {orderStaff: {contains: filter.keyword, mode: 'insensitive'}},
      {notes: {contains: filter.keyword, mode: 'insensitive'}},
    ]
  }

  // 詳細フィルター
  if (filter.customerName) {
    where.customerName = {contains: filter.customerName, mode: 'insensitive'}
  }

  if (filter.staffName) {
    where.orderStaff = {contains: filter.staffName, mode: 'insensitive'}
  }

  if (filter.productName) {
    where.items = {
      some: {
        productName: {contains: filter.productName, mode: 'insensitive'},
      },
    }
  }

  const reservations = await prisma.sbmReservation.findMany({
    where,
    include: {
      items: true,
      tasks: true,
      changeHistory: {
        orderBy: {changedAt: 'desc'},
        take: 10,
      },
    },
    orderBy: {deliveryDate: 'desc'},
  })

  return reservations.map(r => ({
    id: r.id,
    customerId: r.customerId,
    customerName: r.customerName,
    contactName: r.contactName || '',
    phoneNumber: r.phoneNumber,
    deliveryAddress: r.deliveryAddress,
    deliveryDate: r.deliveryDate,
    pickupLocation: r.pickupLocation as '配達' | '店舗受取',
    purpose: r.purpose as '会議' | '研修' | '接待' | 'イベント' | '懇親会' | 'その他',
    paymentMethod: r.paymentMethod as '現金' | '銀行振込' | '請求書' | 'クレジットカード',
    orderChannel: r.orderChannel as '電話' | 'FAX' | 'メール' | 'Web' | '営業' | 'その他',
    totalAmount: r.totalAmount,
    pointsUsed: r.pointsUsed,
    finalAmount: r.finalAmount,
    orderStaff: r.orderStaff,
    notes: r.notes || '',
    deliveryCompleted: r.deliveryCompleted,
    recoveryCompleted: r.recoveryCompleted,
    items: r.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    tasks: r.tasks.map(task => ({
      id: task.id,
      taskType: task.taskType as 'delivery' | 'recovery',
      isCompleted: task.isCompleted,
      completedAt: task.completedAt,
      notes: task.notes || '',
    })),
    changeHistory: r.changeHistory.map(ch => ({
      id: ch.id,
      changedBy: ch.changedBy,
      changeType: ch.changeType as 'create' | 'update' | 'delete',
      changedAt: ch.changedAt,
      changedFields: (ch.changedFields as Record<string, any>) || {},
      oldValues: (ch.oldValues as Record<string, any>) || {},
      newValues: (ch.newValues as Record<string, any>) || {},
    })),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
}

// 顧客管理アクション
export async function createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const newCustomer = await prisma.sbmCustomer.create({
      data: {
        companyName: customerData.companyName,
        contactName: customerData.contactName || null,
        phoneNumber: customerData.phoneNumber,
        deliveryAddress: customerData.deliveryAddress,
        postalCode: customerData.postalCode || null,
        email: customerData.email || null,
        availablePoints: customerData.availablePoints || 0,
        notes: customerData.notes || null,
      },
    })

    revalidatePath('/sbm')
    return {success: true, data: newCustomer}
  } catch (error) {
    console.error('顧客作成エラー:', error)
    return {success: false, error: '顧客の作成に失敗しました'}
  }
}

export async function updateCustomer(id: string, customerData: Partial<Customer>) {
  try {
    const updatedCustomer = await prisma.sbmCustomer.update({
      where: {id},
      data: {
        companyName: customerData.companyName,
        contactName: customerData.contactName || null,
        phoneNumber: customerData.phoneNumber,
        deliveryAddress: customerData.deliveryAddress,
        postalCode: customerData.postalCode || null,
        email: customerData.email || null,
        availablePoints: customerData.availablePoints,
        notes: customerData.notes || null,
      },
    })

    revalidatePath('/sbm')
    return {success: true, data: updatedCustomer}
  } catch (error) {
    console.error('顧客更新エラー:', error)
    return {success: false, error: '顧客の更新に失敗しました'}
  }
}

export async function deleteCustomer(id: string) {
  try {
    // 予約がある場合は削除を防ぐ
    const reservationCount = await prisma.sbmReservation.count({
      where: {customerId: id},
    })

    if (reservationCount > 0) {
      return {success: false, error: 'この顧客には予約履歴があるため削除できません'}
    }

    await prisma.sbmCustomer.delete({
      where: {id},
    })

    revalidatePath('/sbm')
    return {success: true}
  } catch (error) {
    console.error('顧客削除エラー:', error)
    return {success: false, error: '顧客の削除に失敗しました'}
  }
}

// 商品管理アクション
export async function createProduct(productData: Omit<Product, 'id' | 'priceHistory' | 'createdAt' | 'updatedAt'>) {
  try {
    const newProduct = await prisma.sbmProduct.create({
      data: {
        name: productData.name,
        description: productData.description || null,
        currentPrice: productData.currentPrice,
        currentCost: productData.currentCost,
        category: productData.category,
        isActive: productData.isActive,
        priceHistory: {
          create: {
            price: productData.currentPrice,
            cost: productData.currentCost,
            effectiveDate: new Date(),
          },
        },
      },
      include: {priceHistory: true},
    })

    revalidatePath('/sbm')
    return {success: true, data: newProduct}
  } catch (error) {
    console.error('商品作成エラー:', error)
    return {success: false, error: '商品の作成に失敗しました'}
  }
}

export async function updateProduct(id: string, productData: Partial<Product>) {
  try {
    const currentProduct = await prisma.sbmProduct.findUnique({where: {id}})
    if (!currentProduct) {
      return {success: false, error: '商品が見つかりません'}
    }

    // 価格または原価が変更された場合、履歴を追加
    const shouldCreateHistory =
      productData.currentCost !== undefined &&
      productData.currentPrice !== undefined &&
      (productData.currentCost !== currentProduct.currentCost || productData.currentPrice !== currentProduct.currentPrice)

    const updatedProduct = await prisma.sbmProduct.update({
      where: {id},
      data: {
        name: productData.name,
        description: productData.description || null,
        currentPrice: productData.currentPrice,
        currentCost: productData.currentCost,
        category: productData.category,
        isActive: productData.isActive,
        ...(shouldCreateHistory && {
          priceHistory: {
            create: {
              price: productData.currentPrice!,
              cost: productData.currentCost!,
              effectiveDate: new Date(),
            },
          },
        }),
      },
      include: {priceHistory: true},
    })

    revalidatePath('/sbm')
    return {success: true, data: updatedProduct}
  } catch (error) {
    console.error('商品更新エラー:', error)
    return {success: false, error: '商品の更新に失敗しました'}
  }
}

export async function deleteProduct(id: string) {
  try {
    // 予約アイテムで使用されている場合は削除を防ぐ
    const itemCount = await prisma.sbmReservationItem.count({
      where: {productId: id},
    })

    if (itemCount > 0) {
      return {success: false, error: 'この商品は予約で使用されているため削除できません'}
    }

    await prisma.sbmProduct.delete({
      where: {id},
    })

    revalidatePath('/sbm')
    return {success: true}
  } catch (error) {
    console.error('商品削除エラー:', error)
    return {success: false, error: '商品の削除に失敗しました'}
  }
}

// 予約管理アクション
export async function createReservation(
  reservationData: Omit<Reservation, 'id' | 'tasks' | 'changeHistory' | 'createdAt' | 'updatedAt'>
) {
  try {
    const newReservation = await prisma.sbmReservation.create({
      data: {
        customerId: reservationData.customerId,
        customerName: reservationData.customerName,
        contactName: reservationData.contactName || null,
        phoneNumber: reservationData.phoneNumber,
        deliveryAddress: reservationData.deliveryAddress,
        deliveryDate: reservationData.deliveryDate,
        pickupLocation: reservationData.pickupLocation,
        purpose: reservationData.purpose,
        paymentMethod: reservationData.paymentMethod,
        orderChannel: reservationData.orderChannel,
        totalAmount: reservationData.totalAmount,
        pointsUsed: reservationData.pointsUsed,
        finalAmount: reservationData.finalAmount,
        orderStaff: reservationData.orderStaff,
        notes: reservationData.notes || null,
        deliveryCompleted: reservationData.deliveryCompleted,
        recoveryCompleted: reservationData.recoveryCompleted,
        items: {
          create: reservationData.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
        tasks: {
          create: [
            {taskType: 'delivery', isCompleted: false},
            {taskType: 'recovery', isCompleted: false},
          ],
        },
        changeHistory: {
          create: {
            changedBy: reservationData.orderStaff,
            changeType: 'create',
            newValues: reservationData as any,
          },
        },
      },
      include: {
        items: true,
        tasks: true,
        changeHistory: true,
      },
    })

    revalidatePath('/sbm')
    return {success: true, data: newReservation}
  } catch (error) {
    console.error('予約作成エラー:', error)
    return {success: false, error: '予約の作成に失敗しました'}
  }
}

export async function updateReservation(id: string, reservationData: Partial<Reservation>) {
  try {
    const currentReservation = await prisma.sbmReservation.findUnique({
      where: {id},
      include: {items: true},
    })

    if (!currentReservation) {
      return {success: false, error: '予約が見つかりません'}
    }

    const updatedReservation = await prisma.sbmReservation.update({
      where: {id},
      data: {
        customerName: reservationData.customerName,
        contactName: reservationData.contactName || null,
        phoneNumber: reservationData.phoneNumber,
        deliveryAddress: reservationData.deliveryAddress,
        deliveryDate: reservationData.deliveryDate,
        pickupLocation: reservationData.pickupLocation,
        purpose: reservationData.purpose,
        paymentMethod: reservationData.paymentMethod,
        orderChannel: reservationData.orderChannel,
        totalAmount: reservationData.totalAmount,
        pointsUsed: reservationData.pointsUsed,
        finalAmount: reservationData.finalAmount,
        orderStaff: reservationData.orderStaff,
        notes: reservationData.notes || null,
        deliveryCompleted: reservationData.deliveryCompleted,
        recoveryCompleted: reservationData.recoveryCompleted,
        changeHistory: {
          create: {
            changedBy: reservationData.orderStaff || 'system',
            changeType: 'update',
            oldValues: currentReservation as any,
            newValues: reservationData as any,
          },
        },
      },
      include: {
        items: true,
        tasks: true,
        changeHistory: true,
      },
    })

    revalidatePath('/sbm')
    return {success: true, data: updatedReservation}
  } catch (error) {
    console.error('予約更新エラー:', error)
    return {success: false, error: '予約の更新に失敗しました'}
  }
}

export async function deleteReservation(id: string) {
  try {
    await prisma.sbmReservation.delete({
      where: {id},
    })

    revalidatePath('/sbm')
    return {success: true}
  } catch (error) {
    console.error('予約削除エラー:', error)
    return {success: false, error: '予約の削除に失敗しました'}
  }
}

// ダッシュボード統計
export async function getDashboardStats(date: string): Promise<DashboardStats> {
  const targetDate = new Date(date)
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  const reservations = await prisma.sbmReservation.findMany({
    where: {
      deliveryDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {items: true},
  })

  const totalSales = reservations.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalCost = reservations.reduce(
    (sum, r) => sum + r.items.reduce((itemSum, item) => itemSum + item.unitPrice * item.quantity * 0.6, 0),
    0
  ) // 原価率60%と仮定
  const profit = totalSales - totalCost
  const orderCount = reservations.length
  const avgOrderValue = orderCount > 0 ? Math.round(totalSales / orderCount) : 0

  const salesByPurpose = reservations.reduce(
    (acc, r) => {
      const existing = acc.find(item => item.purpose === r.purpose)
      if (existing) {
        existing.count += 1
        existing.amount += r.totalAmount
      } else {
        acc.push({
          purpose: r.purpose,
          count: 1,
          amount: r.totalAmount,
        })
      }
      return acc
    },
    [] as {purpose: any; count: number; amount: number}[]
  )

  const salesByProduct = reservations.reduce(
    (acc, r) => {
      r.items.forEach(item => {
        const existing = acc.find(p => p.productName === item.productName)
        if (existing) {
          existing.count += item.quantity
          existing.amount += item.totalPrice
        } else {
          acc.push({
            productName: item.productName,
            count: item.quantity,
            amount: item.totalPrice,
          })
        }
      })
      return acc
    },
    [] as {productName: string; count: number; amount: number}[]
  )

  return {
    totalSales,
    totalCost,
    profit,
    orderCount,
    avgOrderValue,
    salesByPurpose,
    salesByProduct,
  }
}

// RFM分析
export async function getRFMAnalysis(): Promise<RFMCustomer[]> {
  const customers = await prisma.sbmCustomer.findMany({
    include: {
      reservations: {
        orderBy: {deliveryDate: 'desc'},
      },
    },
  })

  const today = new Date()
  const rfmData = customers
    .filter(customer => customer.reservations.length > 0)
    .map(customer => {
      const customerReservations = customer.reservations

      const lastOrderDate = new Date(Math.max(...customerReservations.map(r => r.deliveryDate.getTime())))
      const recency = Math.floor((today.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      const frequency = customerReservations.length
      const monetary = customerReservations.reduce((sum, r) => sum + r.totalAmount, 0)

      // スコア計算
      const rScore =
        recency <= RFM_SCORE_CRITERIA.RECENCY.EXCELLENT
          ? 5
          : recency <= RFM_SCORE_CRITERIA.RECENCY.GOOD
            ? 4
            : recency <= RFM_SCORE_CRITERIA.RECENCY.AVERAGE
              ? 3
              : recency <= RFM_SCORE_CRITERIA.RECENCY.POOR
                ? 2
                : 1

      const fScore =
        frequency >= RFM_SCORE_CRITERIA.FREQUENCY.EXCELLENT
          ? 5
          : frequency >= RFM_SCORE_CRITERIA.FREQUENCY.GOOD
            ? 4
            : frequency >= RFM_SCORE_CRITERIA.FREQUENCY.AVERAGE
              ? 3
              : frequency >= RFM_SCORE_CRITERIA.FREQUENCY.POOR
                ? 2
                : 1

      const mScore =
        monetary >= RFM_SCORE_CRITERIA.MONETARY.EXCELLENT
          ? 5
          : monetary >= RFM_SCORE_CRITERIA.MONETARY.GOOD
            ? 4
            : monetary >= RFM_SCORE_CRITERIA.MONETARY.AVERAGE
              ? 3
              : monetary >= RFM_SCORE_CRITERIA.MONETARY.POOR
                ? 2
                : 1

      const totalScore = rScore + fScore + mScore
      const rank =
        totalScore >= 13 ? 'VIP' : totalScore >= 10 ? '優良' : totalScore >= 7 ? '安定' : totalScore >= 5 ? '一般' : '離反懸念'

      return {
        customerId: customer.id,
        customerName: customer.companyName,
        recency,
        frequency,
        monetary,
        rScore,
        fScore,
        mScore,
        totalScore,
        rank,
        lastOrderDate,
      }
    })

  return rfmData.sort((a, b) => b.rScore + b.fScore + b.mScore - (a.rScore + a.fScore + a.mScore))
}

// 外部API連携
export async function lookupAddressByPostalCode(postalCode: string) {
  try {
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`)
    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        success: true,
        data: {
          prefecture: result.address1,
          city: result.address2,
          address: result.address3,
          fullAddress: `${result.address1}${result.address2}${result.address3}`,
        },
      }
    }

    return {success: false, error: '住所が見つかりませんでした'}
  } catch (error) {
    return {success: false, error: '住所検索に失敗しました'}
  }
}

export async function lookupCustomerByPhone(phoneNumber: string): Promise<Customer | null> {
  const cleanPhoneNumber = phoneNumber.replace(/-/g, '')

  const customer = await prisma.sbmCustomer.findFirst({
    where: {
      phoneNumber: {
        contains: cleanPhoneNumber,
      },
    },
  })

  if (!customer) return null

  return {
    id: customer.id,
    companyName: customer.companyName,
    contactName: customer.contactName || '',
    phoneNumber: customer.phoneNumber,
    deliveryAddress: customer.deliveryAddress,
    postalCode: customer.postalCode || '',
    email: customer.email || '',
    availablePoints: customer.availablePoints,
    notes: customer.notes || '',
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  }
}
