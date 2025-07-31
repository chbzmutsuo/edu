'use server'

import {Customer, Product, User, Reservation, DeliveryTeam} from '../types'

// モックデータ生成関数（開発用）
export const generateMockData = () => {
  const customers: Customer[] = [
    {
      id: 'cust-1',
      name: '株式会社 岡山商事',
      contactName: '山田 太郎',
      contactKana: 'ヤマダ タロウ',
      phoneNumber: '0862231111',
      postalCode: '7000904',
      prefecture: '岡山県',
      city: '岡山市北区',
      street: '柳町1-1-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'cust-2',
      name: '倉敷工業大学',
      contactName: '鈴木 花子',
      contactKana: 'スズキ ハナコ',
      phoneNumber: '0864222222',
      postalCode: '7100055',
      prefecture: '岡山県',
      city: '倉敷市',
      street: '阿知3-21-8',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: 'cust-3',
      name: '佐藤 一郎',
      contactName: '佐藤 一郎',
      contactKana: 'サトウ イチロウ',
      phoneNumber: '09012345678',
      postalCode: '7000822',
      prefecture: '岡山県',
      city: '岡山市北区',
      street: '表町3-11-5',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ]

  const products: Product[] = [
    {
      id: 'prod-1',
      name: '特製幕の内弁当',
      currentCost: 600,
      currentPrice: 1200,
      priceHistory: [
        {
          id: 'ph-1',
          productId: 'prod-1',
          cost: 600,
          price: 1200,
          effectiveDate: new Date('2024-01-01'),
          createdBy: 'admin',
          createdAt: new Date('2024-01-01'),
        },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'prod-2',
      name: '彩り野菜のヘルシー弁当',
      currentCost: 500,
      currentPrice: 950,
      priceHistory: [
        {
          id: 'ph-2',
          productId: 'prod-2',
          cost: 500,
          price: 950,
          effectiveDate: new Date('2024-01-01'),
          createdBy: 'admin',
          createdAt: new Date('2024-01-01'),
        },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'prod-3',
      name: 'レジ袋',
      currentCost: 1,
      currentPrice: 5,
      priceHistory: [
        {
          id: 'ph-3',
          productId: 'prod-3',
          cost: 1,
          price: 5,
          effectiveDate: new Date('2024-01-01'),
          createdBy: 'admin',
          createdAt: new Date('2024-01-01'),
        },
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ]

  const users: User[] = [
    {
      id: 'user-1',
      name: '管理者',
      phoneNumber: '0862223333',
      address: '岡山市北区本町1-1-1',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'user-2',
      name: '田中 次郎',
      phoneNumber: '0862224444',
      address: '岡山市中区東町2-2-2',
      role: 'staff',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ]

  const teams: DeliveryTeam[] = [
    {
      id: 'team-1',
      name: 'チームA',
      members: ['田中 次郎', '佐藤 三郎'],
      isActive: true,
    },
    {
      id: 'team-2',
      name: 'チームB',
      members: ['鈴木 四郎', '高橋 五郎'],
      isActive: true,
    },
  ]

  // 今日の予約データを生成
  const today = new Date()
  const reservations: Reservation[] = []

  for (let i = 0; i < 10; i++) {
    const customer = customers[i % customers.length]
    const product = products[i % products.length]
    const deliveryDate = new Date(today)
    deliveryDate.setHours(11 + (i % 6), 0, 0, 0)

    const quantity = 5 + (i % 10)
    const reservation: Reservation = {
      id: `res-${i + 1}`,
      customerId: customer.id,
      customerName: customer.name,
      contactName: customer.contactName,
      phoneNumber: customer.phoneNumber,
      deliveryAddress: `${customer.prefecture}${customer.city}${customer.street}`,
      deliveryDate,
      orderChannel: i % 2 === 0 ? '電話' : 'Web',
      purpose: i % 3 === 0 ? '会議' : i % 3 === 1 ? 'お祝い事' : 'イベント',
      paymentMethod: i % 2 === 0 ? '現金' : '請求書',
      pickupLocation: i % 4 === 0 ? '店舗' : '配達',
      pointUsage: i % 5 === 0 ? 100 : 0,
      orderStaff: users[i % users.length].name,
      notes: i % 3 === 0 ? '時間厳守でお願いします' : '',
      items: [
        {
          id: `item-${i + 1}`,
          reservationId: `res-${i + 1}`,
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.currentPrice,
          unitCost: product.currentCost,
          totalPrice: quantity * product.currentPrice,
          totalCost: quantity * product.currentCost,
        },
      ],
      totalAmount: quantity * product.currentPrice - (i % 5 === 0 ? 100 : 0),
      totalCost: quantity * product.currentCost,
      teamId: i % 4 === 0 ? undefined : teams[i % teams.length].id,
      tasks: {
        delivered: i % 3 === 0,
        collected: i % 4 === 0,
      },
      changeHistory: [
        {
          id: `ch-${i + 1}`,
          reservationId: `res-${i + 1}`,
          changedBy: users[0].name,
          changeType: 'created',
          changeDetails: '予約を作成しました',
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    reservations.push(reservation)
  }

  return {
    customers,
    products,
    users,
    teams,
    reservations,
  }
}

// 日付範囲でデータをフィルタリング
export const filterByDateRange = <T extends {deliveryDate?: Date; createdAt?: Date}>(
  data: T[],
  startDate: string,
  endDate: string,
  dateField: 'deliveryDate' | 'createdAt' = 'deliveryDate'
): T[] => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999) // 終日を含む

  return data.filter(item => {
    const date = item[dateField]
    if (!date) return false
    return date >= start && date <= end
  })
}

// キーワードでデータを検索
export const searchByKeyword = <T extends Record<string, any>>(data: T[], keyword: string, searchFields: (keyof T)[]): T[] => {
  if (!keyword.trim()) return data

  const lowerKeyword = keyword.toLowerCase()
  return data.filter(item =>
    searchFields.some(field => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerKeyword)
      }
      return false
    })
  )
}
