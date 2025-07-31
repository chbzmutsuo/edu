'use server'

import {Reservation, ReservationItem} from '@app/(apps)/sbm/types'
import {revalidatePath} from 'next/cache'
import prisma from 'src/lib/prisma'

// シードデータ生成
export async function seedDatabase() {
  try {
    // サンプル顧客データ
    const customers = [
      {
        companyName: '株式会社サンプル商事',
        contactName: '田中太郎',
        phoneNumber: '03-1234-5678',
        deliveryAddress: '東京都千代田区丸の内1-1-1',
        postalCode: '100-0005',
        email: 'tanaka@sample-corp.jp',
        availablePoints: 1000,
        notes: 'VIPクライアント',
      },
      {
        companyName: 'テスト株式会社',
        contactName: '佐藤花子',
        phoneNumber: '03-2345-6789',
        deliveryAddress: '東京都新宿区新宿2-2-2',
        postalCode: '160-0022',
        email: 'sato@test-inc.jp',
        availablePoints: 500,
        notes: '定期利用',
      },
      {
        companyName: '開発合同会社',
        contactName: '鈴木次郎',
        phoneNumber: '03-3456-7890',
        deliveryAddress: '東京都渋谷区渋谷3-3-3',
        postalCode: '150-0002',
        email: 'suzuki@dev-llc.jp',
        availablePoints: 0,
        notes: '',
      },
      {
        companyName: 'イノベーション企業',
        contactName: '高橋美咲',
        phoneNumber: '03-4567-8901',
        deliveryAddress: '東京都港区赤坂4-4-4',
        postalCode: '107-0052',
        email: 'takahashi@innovation.jp',
        availablePoints: 2000,
        notes: '大口顧客',
      },
      {
        companyName: 'スタートアップ株式会社',
        contactName: '山田健一',
        phoneNumber: '03-5678-9012',
        deliveryAddress: '東京都品川区大井5-5-5',
        postalCode: '140-0014',
        email: 'yamada@startup.jp',
        availablePoints: 300,
        notes: '新規顧客',
      },
    ]

    // サンプル商品データ
    const products = [
      {
        name: '幕の内弁当',
        description: '伝統的な日本の幕の内弁当。バランス良く様々なおかずが楽しめます。',
        currentPrice: 800,
        currentCost: 480,
        category: '和食',
        isActive: true,
      },
      {
        name: '唐揚げ弁当',
        description: 'ジューシーな唐揚げがメインの人気弁当。',
        currentPrice: 650,
        currentCost: 390,
        category: '和食',
        isActive: true,
      },
      {
        name: 'ハンバーグ弁当',
        description: 'デミグラスソースのハンバーグ弁当。',
        currentPrice: 700,
        currentCost: 420,
        category: '洋食',
        isActive: true,
      },
      {
        name: '海老フライ弁当',
        description: 'プリプリの海老フライが自慢の弁当。',
        currentPrice: 900,
        currentCost: 540,
        category: '和食',
        isActive: true,
      },
      {
        name: '焼肉弁当',
        description: 'タレが美味しい焼肉弁当。',
        currentPrice: 850,
        currentCost: 510,
        category: '和食',
        isActive: true,
      },
      {
        name: 'チキン南蛮弁当',
        description: 'タルタルソースたっぷりのチキン南蛮弁当。',
        currentPrice: 750,
        currentCost: 450,
        category: '和食',
        isActive: true,
      },
      {
        name: 'オムライス弁当',
        description: 'ふわトロ卵のオムライス弁当。',
        currentPrice: 680,
        currentCost: 408,
        category: '洋食',
        isActive: true,
      },
      {
        name: 'とんかつ弁当',
        description: 'サクサクとんかつの定番弁当。',
        currentPrice: 800,
        currentCost: 480,
        category: '和食',
        isActive: true,
      },
    ]

    // サンプルユーザーデータ
    const users = [
      {
        username: 'admin',
        name: '管理者',
        email: 'admin@sbm.local',
        role: 'admin',
        isActive: true,
      },
      {
        username: 'manager1',
        name: '店長 田中',
        email: 'manager1@sbm.local',
        role: 'manager',
        isActive: true,
      },
      {
        username: 'staff1',
        name: 'スタッフ 佐藤',
        email: 'staff1@sbm.local',
        role: 'staff',
        isActive: true,
      },
      {
        username: 'staff2',
        name: 'スタッフ 鈴木',
        email: 'staff2@sbm.local',
        role: 'staff',
        isActive: true,
      },
    ]

    // 配達チームデータ
    const teams = [
      {
        name: 'チーム A',
        driverName: '配達員 山田',
        vehicleInfo: '軽トラック（品川100あ1234）',
        capacity: 50,
        isActive: true,
      },
      {
        name: 'チーム B',
        driverName: '配達員 田中',
        vehicleInfo: 'バン（品川200い5678）',
        capacity: 80,
        isActive: true,
      },
      {
        name: 'チーム C',
        driverName: '配達員 佐藤',
        vehicleInfo: '軽トラック（品川300う9012）',
        capacity: 45,
        isActive: true,
      },
    ]

    // データベースに挿入
    const createdCustomers = await Promise.all(customers.map(customer => prisma.sbmCustomer.create({data: customer})))

    const createdProducts = await Promise.all(
      products.map(product =>
        prisma.sbmProduct.create({
          data: {
            ...product,
            priceHistory: {
              create: {
                price: product.currentPrice,
                cost: product.currentCost,
                effectiveDate: new Date(),
              },
            },
          },
        })
      )
    )

    const createdUsers = await Promise.all(users.map(user => prisma.sbmUser.create({data: user})))

    const createdTeams = await Promise.all(teams.map(team => prisma.sbmDeliveryTeam.create({data: team})))

    // サンプル予約データ（直近1ヶ月分）
    const today = new Date()
    const reservations: Reservation[] = []

    for (let i = 0; i < 15; i++) {
      const deliveryDate = new Date(today)
      deliveryDate.setDate(today.getDate() + Math.floor(Math.random() * 30) - 15) // 過去15日〜未来15日
      deliveryDate.setHours(12, 0, 0, 0) // 12:00固定

      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)]
      const staff = createdUsers[Math.floor(Math.random() * createdUsers.length)]

      // ランダムに1-4個の商品を選択
      const numItems = Math.floor(Math.random() * 4) + 1
      const selectedProducts: ReservationItem[] = []
      for (let j = 0; j < numItems; j++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)]
        const quantity = Math.floor(Math.random() * 10) + 1
        selectedProducts.push({
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.currentPrice,
          totalPrice: product.currentPrice * quantity,
        })
      }

      const totalAmount = selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0)
      const pointsUsed = Math.floor(Math.random() * Math.min(customer.availablePoints, totalAmount * 0.1))
      const finalAmount = totalAmount - pointsUsed

      const purposes = ['会議', '研修', '接待', 'イベント', '懇親会', 'その他']
      const paymentMethods = ['現金', '銀行振込', '請求書', 'クレジットカード']
      const orderChannels = ['電話', 'FAX', 'メール', 'Web', '営業', 'その他']
      const pickupLocations = ['配達', '店舗受取']

      reservations.push({
        customerId: customer.id,
        customerName: customer.companyName,
        contactName: customer.contactName,
        phoneNumber: customer.phoneNumber,
        deliveryAddress: customer.deliveryAddress,
        deliveryDate,
        pickupLocation: pickupLocations[Math.floor(Math.random() * pickupLocations.length)],
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        orderChannel: orderChannels[Math.floor(Math.random() * orderChannels.length)],
        totalAmount,
        pointsUsed,
        finalAmount,
        orderStaff: staff.name,
        orderStaffId: staff.id,
        notes: Math.random() > 0.7 ? 'サンプル備考テキスト' : null,
        deliveryCompleted: deliveryDate < today ? Math.random() > 0.2 : false,
        recoveryCompleted: deliveryDate < today ? Math.random() > 0.3 : false,
        items: selectedProducts,
      })
    }

    const createdReservations = await Promise.all(
      reservations.map(reservation =>
        prisma.sbmReservation.create({
          data: {
            customerId: reservation.customerId,
            customerName: reservation.customerName,
            contactName: reservation.contactName,
            phoneNumber: reservation.phoneNumber,
            deliveryAddress: reservation.deliveryAddress,
            deliveryDate: reservation.deliveryDate,
            pickupLocation: reservation.pickupLocation,
            purpose: reservation.purpose,
            paymentMethod: reservation.paymentMethod,
            orderChannel: reservation.orderChannel,
            totalAmount: reservation.totalAmount,
            pointsUsed: reservation.pointsUsed,
            finalAmount: reservation.finalAmount,
            orderStaff: reservation.orderStaff,
            orderStaffId: reservation.orderStaffId,
            notes: reservation.notes,
            deliveryCompleted: reservation.deliveryCompleted,
            recoveryCompleted: reservation.recoveryCompleted,
            items: {
              create: reservation.items,
            },
            tasks: {
              create: [
                {taskType: 'delivery', isCompleted: reservation.deliveryCompleted},
                {taskType: 'recovery', isCompleted: reservation.recoveryCompleted},
              ],
            },
            changeHistory: {
              create: {
                changedBy: reservation.orderStaff,
                changeType: 'create',
                newValues: reservation as any,
              },
            },
          },
        })
      )
    )

    revalidatePath('/sbm')
    return {
      success: true,
      data: {
        counts: {
          customers: createdCustomers.length,
          products: createdProducts.length,
          users: createdUsers.length,
          teams: createdTeams.length,
          reservations: createdReservations.length,
        },
      },
    }
  } catch (error) {
    console.error('Seed error:', error)
    return {success: false, error: 'シード処理に失敗しました'}
  }
}

// データベースクリア
export async function clearDatabase() {
  try {
    // リレーションを考慮した順序で削除
    await prisma.sbmReservationChangeHistory.deleteMany()
    await prisma.sbmReservationTask.deleteMany()
    await prisma.sbmReservationItem.deleteMany()
    await prisma.sbmDeliveryAssignment.deleteMany()
    await prisma.sbmReservation.deleteMany()
    await prisma.sbmRfmAnalysis.deleteMany()
    await prisma.sbmProductPriceHistory.deleteMany()
    await prisma.sbmProduct.deleteMany()
    await prisma.sbmDeliveryTeam.deleteMany()
    await prisma.sbmUser.deleteMany()
    await prisma.sbmCustomer.deleteMany()

    revalidatePath('/sbm')
    return {success: true}
  } catch (error) {
    console.error('Clear database error:', error)
    return {success: false, error: 'データベースクリアに失敗しました'}
  }
}

// データベースステータス確認
export async function checkDatabaseStatus() {
  try {
    const [customers, products, users, reservations, teams] = await Promise.all([
      prisma.sbmCustomer.count(),
      prisma.sbmProduct.count(),
      prisma.sbmUser.count(),
      prisma.sbmReservation.count(),
      prisma.sbmDeliveryTeam.count(),
    ])

    return {
      customers,
      products,
      users,
      reservations,
      teams,
    }
  } catch (error) {
    console.error('Status check error:', error)
    return {
      customers: 0,
      products: 0,
      users: 0,
      reservations: 0,
      teams: 0,
    }
  }
}

// データエクスポート
export async function exportData() {
  try {
    const [customers, products, users, teams, reservations] = await Promise.all([
      prisma.sbmCustomer.findMany({include: {reservations: true, rfmAnalysis: true}}),
      prisma.sbmProduct.findMany({include: {priceHistory: true, reservationItems: true}}),
      prisma.sbmUser.findMany({include: {reservations: true, deliveryAssignments: true}}),
      prisma.sbmDeliveryTeam.findMany({include: {deliveryAssignments: true}}),
      prisma.sbmReservation.findMany({
        include: {
          items: true,
          tasks: true,
          changeHistory: true,
          deliveryAssignments: true,
        },
      }),
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        customers,
        products,
        users,
        teams,
        reservations,
      },
    }

    return {success: true, data: exportData}
  } catch (error) {
    console.error('Export error:', error)
    return {success: false, error: 'データエクスポートに失敗しました'}
  }
}

// データインポート
export async function importData(importData: any) {
  try {
    if (!importData.data) {
      return {success: false, error: '無効なデータ形式です'}
    }

    // まずデータをクリア
    await clearDatabase()

    const {customers, products, users, teams, reservations} = importData.data

    // 顧客データをインポート
    if (customers?.length > 0) {
      await Promise.all(
        customers.map((customer: any) =>
          prisma.sbmCustomer.create({
            data: {
              id: customer.id,
              companyName: customer.companyName,
              contactName: customer.contactName,
              phoneNumber: customer.phoneNumber,
              deliveryAddress: customer.deliveryAddress,
              postalCode: customer.postalCode,
              email: customer.email,
              availablePoints: customer.availablePoints,
              notes: customer.notes,
              createdAt: new Date(customer.createdAt),
              updatedAt: new Date(customer.updatedAt),
            },
          })
        )
      )
    }

    // 商品データをインポート
    if (products?.length > 0) {
      await Promise.all(
        products.map((product: any) =>
          prisma.sbmProduct.create({
            data: {
              id: product.id,
              name: product.name,
              description: product.description,
              currentPrice: product.currentPrice,
              currentCost: product.currentCost,
              category: product.category,
              isActive: product.isActive,
              createdAt: new Date(product.createdAt),
              updatedAt: new Date(product.updatedAt),
              priceHistory: {
                create:
                  product.priceHistory?.map((history: any) => ({
                    id: history.id,
                    price: history.price,
                    cost: history.cost,
                    effectiveDate: new Date(history.effectiveDate),
                    createdAt: new Date(history.createdAt),
                  })) || [],
              },
            },
          })
        )
      )
    }

    // ユーザーデータをインポート
    if (users?.length > 0) {
      await Promise.all(
        users.map((user: any) =>
          prisma.sbmUser.create({
            data: {
              id: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
            },
          })
        )
      )
    }

    // チームデータをインポート
    if (teams?.length > 0) {
      await Promise.all(
        teams.map((team: any) =>
          prisma.sbmDeliveryTeam.create({
            data: {
              id: team.id,
              name: team.name,
              driverName: team.driverName,
              vehicleInfo: team.vehicleInfo,
              capacity: team.capacity,
              isActive: team.isActive,
              createdAt: new Date(team.createdAt),
              updatedAt: new Date(team.updatedAt),
            },
          })
        )
      )
    }

    // 予約データをインポート
    if (reservations?.length > 0) {
      await Promise.all(
        reservations.map((reservation: any) =>
          prisma.sbmReservation.create({
            data: {
              id: reservation.id,
              customerId: reservation.customerId,
              customerName: reservation.customerName,
              contactName: reservation.contactName,
              phoneNumber: reservation.phoneNumber,
              deliveryAddress: reservation.deliveryAddress,
              deliveryDate: new Date(reservation.deliveryDate),
              pickupLocation: reservation.pickupLocation,
              purpose: reservation.purpose,
              paymentMethod: reservation.paymentMethod,
              orderChannel: reservation.orderChannel,
              totalAmount: reservation.totalAmount,
              pointsUsed: reservation.pointsUsed,
              finalAmount: reservation.finalAmount,
              orderStaff: reservation.orderStaff,
              orderStaffId: reservation.orderStaffId,
              notes: reservation.notes,
              deliveryCompleted: reservation.deliveryCompleted,
              recoveryCompleted: reservation.recoveryCompleted,
              createdAt: new Date(reservation.createdAt),
              updatedAt: new Date(reservation.updatedAt),
              items: {
                create:
                  reservation.items?.map((item: any) => ({
                    id: item.id,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    createdAt: new Date(item.createdAt),
                  })) || [],
              },
              tasks: {
                create:
                  reservation.tasks?.map((task: any) => ({
                    id: task.id,
                    taskType: task.taskType,
                    isCompleted: task.isCompleted,
                    completedAt: task.completedAt ? new Date(task.completedAt) : null,
                    notes: task.notes,
                    createdAt: new Date(task.createdAt),
                    updatedAt: new Date(task.updatedAt),
                  })) || [],
              },
              changeHistory: {
                create:
                  reservation.changeHistory?.map((history: any) => ({
                    id: history.id,
                    changedBy: history.changedBy,
                    changeType: history.changeType,
                    changedFields: history.changedFields,
                    oldValues: history.oldValues,
                    newValues: history.newValues,
                    changedAt: new Date(history.changedAt),
                  })) || [],
              },
            },
          })
        )
      )
    }

    revalidatePath('/sbm')
    return {success: true}
  } catch (error) {
    console.error('Import error:', error)
    return {success: false, error: 'データインポートに失敗しました'}
  }
}
