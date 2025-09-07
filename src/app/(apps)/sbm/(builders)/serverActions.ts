'use server'


import {
  Customer,
  Product,
  User,
  Reservation,
  ReservationFilter,
  DashboardStats,
  CustomerPhone,
  CustomerSearchResult,
} from '../types'
import {RFM_SCORE_CRITERIA} from '../(constants)'
import prisma from 'src/lib/prisma'
import {SbmDeliveryTeam} from '@prisma/client'

// データ取得アクション
export async function getAllCustomers(): Promise<Customer[]> {
  const customers = await prisma.sbmCustomer.findMany({
    include: {
      SbmCustomerPhone: true,
    },
    orderBy: {id: 'asc'},
  })

  return customers.map(c => ({
    id: c.id,
    companyName: c.companyName,
    contactName: c.contactName || '',
    postalCode: c.postalCode || '',
    prefecture: c.prefecture || '',
    city: c.city || '',
    street: c.street || '',
    building: c.building || '',
    email: c.email || '',
    availablePoints: c.availablePoints,
    notes: c.notes || '',
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    phones: c.SbmCustomerPhone,
  }))
}

// 電話番号で顧客を検索
// 電話番号による顧客検索（部分一致）
export async function searchCustomersByPhone(phoneNumber: string): Promise<CustomerSearchResult[]> {
  try {
    if (!phoneNumber || phoneNumber.length < 3) {
      return []
    }

    // 電話番号テーブルからのみ検索（メイン電話番号フィールドは削除済み）
    const mainPhoneCustomers: any[] = []

    // 電話番号テーブルでの検索
    const phoneCustomers = await prisma.sbmCustomer.findMany({
      where: {
        SbmCustomerPhone: {
          some: {
            phoneNumber: {
              contains: phoneNumber,
              mode: 'insensitive',
            },
          },
        },
      },
      include: {
        SbmCustomerPhone: true,
      },
    })

    // 重複を除去してマージ
    const allCustomers = [...mainPhoneCustomers, ...phoneCustomers]
    const uniqueCustomers = allCustomers.filter((customer, index, self) => index === self.findIndex(c => c.id === customer.id))

    return uniqueCustomers.map(customer => {
      // マッチした電話番号を特定
      const matchedPhones: CustomerPhone[] = []

      // メイン電話番号フィールドは削除済み

      // 追加電話番号がマッチした場合
      customer.SbmCustomerPhone.filter(phone => phone.phoneNumber.includes(phoneNumber)).forEach(phone => {
        matchedPhones.push({
          id: phone.id,
          sbmCustomerId: phone.sbmCustomerId,
          label: phone.label,
          phoneNumber: phone.phoneNumber,
          createdAt: phone.createdAt,
          updatedAt: phone.updatedAt,
        })
      })

      return {
        customer: {
          id: customer.id,
          companyName: customer.companyName,
          contactName: customer.contactName || '',
          postalCode: customer.postalCode || '',
          prefecture: customer.prefecture || '',
          city: customer.city || '',
          street: customer.street || '',
          building: customer.building || '',
          email: customer.email || '',
          availablePoints: customer.availablePoints,
          notes: customer.notes || '',

          updatedAt: customer.updatedAt,
          phones: customer.SbmCustomerPhone.map(phone => ({
            id: phone.id,
            sbmCustomerId: phone.sbmCustomerId,
            label: phone.label,
            phoneNumber: phone.phoneNumber,
            createdAt: phone.createdAt,
            updatedAt: phone.updatedAt,
          })),
        },
        matchedPhones,
      }
    })
  } catch (error) {
    console.error('顧客検索エラー:', error)
    return []
  }
}

// 従来の関数は互換性のため残す（deprecated）
export async function getCustomerByPhone(phoneNumber: string): Promise<Customer | null> {
  const customer = await prisma.sbmCustomer.findFirst({
    where: {
      SbmCustomerPhone: {
        some: {phoneNumber: phoneNumber},
      },
    },
    include: {
      SbmCustomerPhone: true,
    },
  })

  if (!customer) return null

  return {
    id: customer.id,
    companyName: customer.companyName,
    contactName: customer.contactName || '',
    postalCode: customer.postalCode || '',
    prefecture: customer.prefecture || '',
    city: customer.city || '',
    street: customer.street || '',
    building: customer.building || '',
    email: customer.email || '',
    availablePoints: customer.availablePoints,
    notes: customer.notes || '',
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    phones: customer.SbmCustomerPhone.map(phone => ({
      id: phone.id,
      sbmCustomerId: phone.sbmCustomerId,
      label: phone.label,
      phoneNumber: phone.phoneNumber,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt,
    })),
  }
}

// 顧客情報をUPSERT（電話番号をキーとして）
export async function createOrUpdateCustomer(
  customerData: Partial<Customer>
): Promise<{success: boolean; customer?: Customer; error?: string}> {
  try {
    const customer = await prisma.sbmCustomer.upsert({
      where: {
        id: customerData.id || 0,
      },
      update: {
        companyName: customerData.companyName || '',
        contactName: customerData.contactName || '',
        postalCode: customerData.postalCode || '',
        prefecture: customerData.prefecture || '',
        city: customerData.city || '',
        street: customerData.street || '',
        building: customerData.building || '',
        email: customerData.email || '',
        availablePoints: customerData.availablePoints || 0,
        notes: customerData.notes || '',
      },
      create: {
        companyName: customerData.companyName || '',
        contactName: customerData.contactName || '',
        postalCode: customerData.postalCode || '',
        prefecture: customerData.prefecture || '',
        city: customerData.city || '',
        street: customerData.street || '',
        building: customerData.building || '',
        email: customerData.email || '',
        availablePoints: customerData.availablePoints || 0,
        notes: customerData.notes || '',
      },
    })

    return {
      success: true,
      customer: {
        id: customer.id,
        companyName: customer.companyName,
        contactName: customer.contactName || '',
        postalCode: customer.postalCode || '',
        prefecture: customer.prefecture || '',
        city: customer.city || '',
        street: customer.street || '',
        building: customer.building || '',
        email: customer.email || '',
        availablePoints: customer.availablePoints,
        notes: customer.notes || '',
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    }
  } catch (error) {
    console.error('顧客データの保存エラー:', error)
    return {success: false, error: '顧客データの保存に失敗しました'}
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.sbmProduct.findMany({
    include: {
      SbmProductPriceHistory: {
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
    priceHistory: p.SbmProductPriceHistory.map(h => ({
      id: h.id,
      productId: h.productId,
      price: h.price,
      cost: h.cost,
      effectiveDate: h.effectiveDate,
    })),

    updatedAt: p.updatedAt,
  }))
}

// 予約登録時用：表示可能な商品のみ取得
export async function getVisibleProducts(): Promise<Product[]> {
  const products = await prisma.sbmProduct.findMany({
    where: {isActive: true},
    include: {
      SbmProductPriceHistory: {
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
    priceHistory: p.SbmProductPriceHistory.map(h => ({
      id: h.id,
      productId: h.productId,
      price: h.price,
      cost: h.cost,
      effectiveDate: h.effectiveDate,
    })),

    updatedAt: p.updatedAt,
  }))
}

// 顧客統合アクション
export async function mergeCustomers(parentId: number, childId: number): Promise<{success: boolean; error?: string}> {
  if (parentId === childId) {
    return {success: false, error: '同じ顧客を統合することはできません'}
  }

  try {
    // トランザクション内で実行
    await prisma.$transaction(async tx => {
      // 子顧客の存在確認
      const parentCustomer = await tx.sbmCustomer.findUnique({where: {id: parentId}})
      const childCustomer = await tx.sbmCustomer.findUnique({where: {id: childId}})

      if (!parentCustomer) {
        throw new Error('統合先の顧客が見つかりません')
      }
      if (!childCustomer) {
        throw new Error('統合元の顧客が見つかりません')
      }

      // 1. 子顧客の予約データを親顧客に移行
      await tx.sbmReservation.updateMany({
        where: {sbmCustomerId: childId},
        data: {sbmCustomerId: parentId},
      })

      // 2. 子顧客の電話番号データを親顧客に移行
      await tx.sbmCustomerPhone.updateMany({
        where: {sbmCustomerId: childId},
        data: {sbmCustomerId: parentId},
      })

      // 3. 子顧客のRFM分析データを親顧客に移行
      await tx.sbmRfmAnalysis.updateMany({
        where: {sbmCustomerId: childId},
        data: {sbmCustomerId: parentId},
      })

      // 4. 子顧客を削除
      await tx.sbmCustomer.delete({
        where: {id: childId},
      })
    })

    return {success: true}
  } catch (error) {
    console.error('顧客統合エラー:', error)
    return {success: false, error: error instanceof Error ? error.message : '顧客統合に失敗しました'}
  }
}

// 電話番号管理アクション
export async function createCustomerPhone(
  customerPhoneData: Omit<CustomerPhone, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.sbmCustomerPhone.create({
      data: {
        sbmCustomerId: customerPhoneData.sbmCustomerId,
        label: customerPhoneData.label,
        phoneNumber: customerPhoneData.phoneNumber,
      },
    })

    return {success: true}
  } catch (error) {
    console.error('電話番号追加エラー:', error)
    return {success: false, error: '電話番号の追加に失敗しました'}
  }
}

export async function updateCustomerPhone(
  id: number,
  customerPhoneData: Partial<CustomerPhone>
): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.sbmCustomerPhone.update({
      where: {id},
      data: {
        label: customerPhoneData.label,
        phoneNumber: customerPhoneData.phoneNumber,
      },
    })

    return {success: true}
  } catch (error) {
    console.error('電話番号更新エラー:', error)
    return {success: false, error: '電話番号の更新に失敗しました'}
  }
}

export async function deleteCustomerPhone(id: number): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.sbmCustomerPhone.delete({
      where: {id},
    })

    return {success: true}
  } catch (error) {
    console.error('電話番号削除エラー:', error)
    return {success: false, error: '電話番号の削除に失敗しました'}
  }
}

// 顧客の電話番号一覧を取得
export async function getCustomerPhones(customerId: number): Promise<CustomerPhone[]> {
  try {
    const phones = await prisma.sbmCustomerPhone.findMany({
      where: {sbmCustomerId: customerId},
    })

    return phones.map(phone => ({
      id: phone.id,
      sbmCustomerId: phone.sbmCustomerId,
      label: phone.label,
      phoneNumber: phone.phoneNumber,
      createdAt: phone.createdAt,
      updatedAt: phone.updatedAt,
    }))
  } catch (error) {
    console.error('電話番号取得エラー:', error)
    return []
  }
}

export async function getAllUsers(): Promise<User[]> {
  // 注意: Userモデルが存在しない場合は、ダミーデータを返す
  // 実際のUserモデルがある場合は、以下のコメントアウトを解除
  /*
  const users = await prisma.user.findMany({
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

    updatedAt: u.updatedAt,
  }))
  */

  // 暫定的にダミーデータを返す
  return [
    {
      id: 1,
      username: 'admin',
      name: '管理者',
      email: 'admin@sbm.local',
      role: 'admin' as const,
      isActive: true,

      updatedAt: new Date(),
    },
    {
      id: 2,
      username: 'staff1',
      name: 'スタッフ1',
      email: 'staff1@sbm.local',
      role: 'staff' as const,
      isActive: true,

      updatedAt: new Date(),
    },
  ]
}

export async function getAllTeams(): Promise<SbmDeliveryTeam[]> {
  const teams = await prisma.sbmDeliveryTeam.findMany({
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

export async function getReservations(filter: ReservationFilter = {}) {
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
    where.SbmReservationItem = {
      some: {
        productName: {contains: filter.productName, mode: 'insensitive'},
      },
    }
  }

  // カテゴリー別フィルター
  if (filter.pickupLocation) {
    where.pickupLocation = filter.pickupLocation
  }

  if (filter.purpose) {
    where.purpose = filter.purpose
  }

  if (filter.paymentMethod) {
    where.paymentMethod = filter.paymentMethod
  }

  if (filter.orderChannel) {
    where.orderChannel = filter.orderChannel
  }

  // 完了状況フィルター
  if (filter.deliveryCompleted !== undefined) {
    where.deliveryCompleted = filter.deliveryCompleted
  }

  if (filter.recoveryCompleted !== undefined) {
    where.recoveryCompleted = filter.recoveryCompleted
  }

  const reservations = await prisma.sbmReservation.findMany({
    where,
    include: {
      SbmReservationItem: true,
      SbmReservationTask: true,
      SbmReservationChangeHistory: {
        orderBy: {changedAt: 'desc'},
        take: 10,
      },
    },
    orderBy: {deliveryDate: 'desc'},
  })

  return reservations.map(r => ({
    id: r.id,
    sbmCustomerId: r.sbmCustomerId,
    customerName: r.customerName,
    contactName: r.contactName || '',
    postalCode: r.postalCode,
    prefecture: r.prefecture,
    city: r.city,
    street: r.street,
    building: r.building,
    deliveryDate: r.deliveryDate,
    pickupLocation: r.pickupLocation as '配達' | '店舗受取',
    purpose: r.purpose as '会議' | '研修' | '接待' | 'イベント' | '懇親会' | 'その他',
    paymentMethod: r.paymentMethod as '現金' | '銀行振込' | '請求書' | 'クレジットカード',
    orderChannel: r.orderChannel as '電話' | 'FAX' | 'メール' | 'Web' | '営業' | 'その他',
    totalAmount: r.totalAmount,
    pointsUsed: r.pointsUsed,
    finalAmount: r.finalAmount,
    orderStaff: r.orderStaff,
    userId: r.userId,
    notes: r.notes || '',
    deliveryCompleted: r.deliveryCompleted,
    recoveryCompleted: r.recoveryCompleted,
    items: r.SbmReservationItem.map(item => ({
      id: item.id,
      sbmReservationId: item.sbmReservationId,
      sbmProductId: item.sbmProductId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    tasks: r.SbmReservationTask.map(task => ({
      id: task.id,
      sbmReservationId: task.sbmReservationId,
      taskType: task.taskType as 'delivery' | 'recovery',
      isCompleted: task.isCompleted,
      completedAt: task.completedAt,
      notes: task.notes || '',
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })),
    changeHistory: r.SbmReservationChangeHistory.map(ch => ({
      id: ch.id,
      sbmReservationId: ch.sbmReservationId,
      changedBy: ch.changedBy,
      changeType: ch.changeType as 'create' | 'update' | 'delete',
      changedAt: ch.changedAt,
      changedFields: (ch.changedFields as Record<string, any>) || {},
      oldValues: (ch.oldValues as Record<string, any>) || {},
      newValues: (ch.newValues as Record<string, any>) || {},
    })),

    updatedAt: r.updatedAt,
  }))
}

// 顧客管理アクション
export async function createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const newCustomer = await prisma.sbmCustomer.create({
      data: {
        companyName: customerData.companyName || '',
        contactName: customerData.contactName || null,

        postalCode: customerData.postalCode || null,
        prefecture: customerData.prefecture || null,
        city: customerData.city || null,
        street: customerData.street || null,
        building: customerData.building || null,
        email: customerData.email || null,
        availablePoints: customerData.availablePoints || 0,
        notes: customerData.notes || null,
      },
    })

    return {success: true, data: newCustomer}
  } catch (error) {
    console.error('顧客作成エラー:', error)
    return {success: false, error: '顧客の作成に失敗しました'}
  }
}

export async function updateCustomer(id: number, customerData: Partial<Customer>) {
  try {
    const updatedCustomer = await prisma.sbmCustomer.update({
      where: {id},
      data: {
        companyName: customerData.companyName,
        contactName: customerData.contactName || null,
        postalCode: customerData.postalCode || null,
        prefecture: customerData.prefecture || null,
        city: customerData.city || null,
        street: customerData.street || null,
        building: customerData.building || null,
        email: customerData.email || null,
        availablePoints: customerData.availablePoints,
        notes: customerData.notes || null,
      },
    })

    return {success: true, data: updatedCustomer}
  } catch (error) {
    console.error('顧客更新エラー:', error)
    return {success: false, error: '顧客の更新に失敗しました'}
  }
}

export async function deleteCustomer(id: number) {
  try {
    // 予約がある場合は削除を防ぐ
    const reservationCount = await prisma.sbmReservation.count({
      where: {sbmCustomerId: id},
    })

    if (reservationCount > 0) {
      return {success: false, error: 'この顧客には予約履歴があるため削除できません'}
    }

    await prisma.sbmCustomer.delete({
      where: {id},
    })

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
        name: productData.name ?? '',
        description: productData.description || null,
        currentPrice: productData.currentPrice || 0,
        currentCost: productData.currentCost || 0,
        category: productData.category ?? '',
        isActive: productData.isActive,
        SbmProductPriceHistory: {
          create: {
            productId: '', // 後で設定
            price: productData.currentPrice || 0,
            cost: productData.currentCost || 0,
            effectiveDate: new Date(),
          },
        },
      },
      include: {SbmProductPriceHistory: true},
    })

    // 価格履歴のproductIdを更新
    await prisma.sbmProductPriceHistory.updateMany({
      where: {sbmProductId: newProduct.id},
      data: {productId: newProduct.id.toString()},
    })

    return {success: true, data: newProduct}
  } catch (error) {
    console.error('商品作成エラー:', error)
    return {success: false, error: '商品の作成に失敗しました'}
  }
}

export async function updateProduct(id: number, productData: Partial<Product>) {
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
          SbmProductPriceHistory: {
            create: {
              productId: id.toString(),
              price: productData.currentPrice!,
              cost: productData.currentCost!,
              effectiveDate: new Date(),
            },
          },
        }),
      },
      include: {SbmProductPriceHistory: true},
    })

    return {success: true, data: updatedProduct}
  } catch (error) {
    console.error('商品更新エラー:', error)
    return {success: false, error: '商品の更新に失敗しました'}
  }
}

export async function deleteProduct(id: number) {
  try {
    // 予約アイテムで使用されている場合は削除を防ぐ

    const itemCount = await prisma.sbmReservationItem.count({
      where: {sbmProductId: id},
    })

    if (itemCount > 0) {
      return {success: false, error: 'この商品は予約で使用されているため削除できません'}
    }

    await prisma.sbmProduct.delete({
      where: {id},
    })

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
        sbmCustomerId: reservationData.sbmCustomerId || 0,
        customerName: reservationData.customerName || '',
        contactName: reservationData.contactName || '',
        phoneNumber: reservationData.phoneNumber || '',
        postalCode: reservationData.postalCode || '',
        prefecture: reservationData.prefecture || '',
        city: reservationData.city || '',
        street: reservationData.street || '',
        building: reservationData.building || '',
        deliveryDate: reservationData.deliveryDate || '',
        pickupLocation: reservationData.pickupLocation || '',
        purpose: reservationData.purpose || '',
        paymentMethod: reservationData.paymentMethod || '',
        orderChannel: reservationData.orderChannel || '',
        totalAmount: reservationData.totalAmount || 0,
        pointsUsed: reservationData.pointsUsed || 0,
        finalAmount: reservationData.finalAmount || 0,
        orderStaff: reservationData.orderStaff || '',
        userId: reservationData.userId || 0,
        notes: reservationData.notes || '',
        deliveryCompleted: reservationData.deliveryCompleted || false,
        recoveryCompleted: reservationData.recoveryCompleted || false,
        SbmReservationItem: {
          create:
            reservationData.items?.map(item => ({
              sbmProductId: item.sbmProductId || 0,
              productName: item.productName || '',
              quantity: item.quantity || 0,
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || 0,
            })) || [],
        },
        SbmReservationTask: {
          create: [
            {taskType: 'delivery', isCompleted: false},
            {taskType: 'recovery', isCompleted: false},
          ],
        },
        SbmReservationChangeHistory: {
          create: {
            changedBy: reservationData.orderStaff || 'system',
            changeType: 'create',
            newValues: reservationData as any,
          },
        },
      },
      include: {
        SbmReservationItem: true,
        SbmReservationTask: true,
        SbmReservationChangeHistory: true,
      },
    })

    return {success: true, data: newReservation}
  } catch (error) {
    console.error('予約作成エラー:', error.message)
    return {success: false, error: '予約の作成に失敗しました'}
  }
}

export async function updateReservation(id: number, reservationData: Partial<Reservation>) {
  try {
    const currentReservation = await prisma.sbmReservation.findUnique({
      where: {id},
      include: {SbmReservationItem: true},
    })

    if (!currentReservation) {
      return {success: false, error: '予約が見つかりません'}
    }

    // 既存の商品明細を削除
    await prisma.sbmReservationItem.deleteMany({
      where: {sbmReservationId: id},
    })

    const updatedReservation = await prisma.sbmReservation.update({
      where: {id},
      data: {
        customerName: reservationData.customerName,
        contactName: reservationData.contactName,
        phoneNumber: reservationData.phoneNumber,
        postalCode: reservationData.postalCode,
        prefecture: reservationData.prefecture,
        city: reservationData.city,
        street: reservationData.street,
        building: reservationData.building,
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
        // 新しい商品明細を作成
        SbmReservationItem: {
          create:
            reservationData.items?.map(item => ({
              sbmProductId: item.sbmProductId || 0,
              productName: item.productName || '',
              quantity: item.quantity || 0,
              unitPrice: item.unitPrice || 0,
              totalPrice: item.totalPrice || 0,
            })) || [],
        },
        SbmReservationChangeHistory: {
          create: {
            changedBy: reservationData.orderStaff || 'system',
            changeType: 'update',
            oldValues: currentReservation as any,
            newValues: reservationData as any,
          },
        },
      },
      include: {
        SbmReservationItem: true,
        SbmReservationTask: true,
        SbmReservationChangeHistory: true,
      },
    })

    return {success: true, data: updatedReservation}
  } catch (error) {
    console.error('予約更新エラー:', error)
    return {success: false, error: '予約の更新に失敗しました'}
  }
}

export async function deleteReservation(id: number) {
  try {
    await prisma.sbmReservation.delete({
      where: {id},
    })

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
    include: {SbmReservationItem: true},
  })

  const totalSales = reservations.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalCost = reservations.reduce(
    (sum, r) => sum + r.SbmReservationItem.reduce((itemSum, item) => itemSum + item.unitPrice * item.quantity * 0.6, 0),
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
      r.SbmReservationItem.forEach(item => {
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
export async function getRFMAnalysis() {
  const customers = await prisma.sbmCustomer.findMany({
    include: {
      SbmReservation: {
        orderBy: {deliveryDate: 'desc'},
      },
    },
  })

  const today = new Date()
  const rfmData = customers
    .filter(customer => customer.SbmReservation.length > 0)
    .map(customer => {
      const customerReservations = customer.SbmReservation

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
      SbmCustomerPhone: {
        some: {
          phoneNumber: {
            contains: cleanPhoneNumber,
          },
        },
      },
    },
  })

  if (!customer) return null

  return {
    id: customer.id,
    companyName: customer.companyName,
    contactName: customer.contactName || '',
    prefecture: customer.prefecture || '',
    city: customer.city || '',
    street: customer.street || '',
    building: customer.building || '',
    postalCode: customer.postalCode || '',
    email: customer.email || '',
    availablePoints: customer.availablePoints,
    notes: customer.notes || '',

    updatedAt: customer.updatedAt,
  }
}
