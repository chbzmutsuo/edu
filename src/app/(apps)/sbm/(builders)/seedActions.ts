// 'use server'

// import {OrderChannel, PaymentMethod, Purpose, ReservationItem} from '@app/(apps)/sbm/types'
// import {PickupLocation} from '@app/(apps)/sbm/types'
// import {revalidatePath} from 'next/cache'
// import prisma from 'src/lib/prisma'

// // シードデータ生成
// export async function seedDatabase() {
//   try {
//     // サンプル顧客データ
//     const customers = [
//       {
//         companyName: '株式会社サンプル商事',
//         contactName: '田中太郎',
//         phoneNumber: '03-1234-5678',
//         postalCode: '100-0005',
//         prefecture: '東京都',
//         city: '千代田区',
//         street: '丸の内1-1-1',
//         building: 'サンプルビル5F',
//         email: 'tanaka@sample-corp.jp',
//         availablePoints: 1000,
//         notes: 'VIPクライアント',
//       },
//       {
//         companyName: 'テスト株式会社',
//         contactName: '佐藤花子',
//         phoneNumber: '03-2345-6789',
//         postalCode: '160-0022',
//         prefecture: '東京都',
//         city: '新宿区',
//         street: '新宿2-2-2',
//         building: 'テストタワー10F',
//         email: 'sato@test-inc.jp',
//         availablePoints: 500,
//         notes: '定期利用',
//       },
//       {
//         companyName: '開発合同会社',
//         contactName: '鈴木次郎',
//         phoneNumber: '03-3456-7890',
//         postalCode: '150-0002',
//         prefecture: '東京都',
//         city: '渋谷区',
//         street: '渋谷3-3-3',
//         building: '開発センタービル3F',
//         email: 'suzuki@dev-llc.jp',
//         availablePoints: 0,
//         notes: '',
//       },
//       {
//         companyName: 'イノベーション企業',
//         contactName: '高橋美咲',
//         phoneNumber: '03-4567-8901',
//         postalCode: '107-0052',
//         prefecture: '東京都',
//         city: '港区',
//         street: '赤坂4-4-4',
//         building: 'イノベーションプラザ8F',
//         email: 'takahashi@innovation.jp',
//         availablePoints: 2000,
//         notes: '大口顧客',
//       },
//       {
//         companyName: 'スタートアップ株式会社',
//         contactName: '山田健一',
//         phoneNumber: '03-5678-9012',
//         postalCode: '140-0014',
//         prefecture: '東京都',
//         city: '品川区',
//         street: '大井5-5-5',
//         building: 'スタートアップハブ2F',
//         email: 'yamada@startup.jp',
//         availablePoints: 300,
//         notes: '新規顧客',
//       },
//       {
//         companyName: '神奈川コーポレーション',
//         contactName: '横浜次郎',
//         phoneNumber: '045-1234-5678',
//         postalCode: '231-0006',
//         prefecture: '神奈川県',
//         city: '横浜市中区',
//         street: '南仲通4-1-3',
//         building: '横浜センタービル12F',
//         email: 'yokohama@kanagawa-corp.jp',
//         availablePoints: 800,
//         notes: '地方顧客',
//       },
//       {
//         companyName: '埼玉製作所',
//         contactName: '大宮花子',
//         phoneNumber: '048-2345-6789',
//         postalCode: '330-0854',
//         prefecture: '埼玉県',
//         city: 'さいたま市大宮区',
//         street: '桜木町1-2-3',
//         building: null,
//         email: 'omiya@saitama-factory.jp',
//         availablePoints: 150,
//         notes: '配達エリア拡大対象',
//       },
//       {
//         companyName: '千葉マリン株式会社',
//         contactName: '船橋太郎',
//         phoneNumber: '047-3456-7890',
//         postalCode: '273-0005',
//         prefecture: '千葉県',
//         city: '船橋市',
//         street: '本町2-3-4',
//         building: 'マリンタワー8F',
//         email: 'funabashi@chiba-marine.jp',
//         availablePoints: 600,
//         notes: '月次定期注文',
//       },
//     ]

//     // サンプル商品データ
//     const products = [
//       {
//         name: '幕の内弁当',
//         description: '伝統的な日本の幕の内弁当。バランス良く様々なおかずが楽しめます。',
//         currentPrice: 800,
//         currentCost: 480,
//         category: '和食',
//         isActive: true,
//       },
//       {
//         name: '唐揚げ弁当',
//         description: 'ジューシーな唐揚げがメインの人気弁当。',
//         currentPrice: 650,
//         currentCost: 390,
//         category: '和食',
//         isActive: true,
//       },
//       {
//         name: 'ハンバーグ弁当',
//         description: 'デミグラスソースのハンバーグ弁当。',
//         currentPrice: 700,
//         currentCost: 420,
//         category: '洋食',
//         isActive: true,
//       },
//       {
//         name: '海老フライ弁当',
//         description: 'プリプリの海老フライが自慢の弁当。',
//         currentPrice: 900,
//         currentCost: 540,
//         category: '和食',
//         isActive: true,
//       },
//       {
//         name: '焼肉弁当',
//         description: 'タレが美味しい焼肉弁当。',
//         currentPrice: 850,
//         currentCost: 510,
//         category: '和食',
//         isActive: true,
//       },
//       {
//         name: 'チキン南蛮弁当',
//         description: 'タルタルソースたっぷりのチキン南蛮弁当。',
//         currentPrice: 750,
//         currentCost: 450,
//         category: '和食',
//         isActive: true,
//       },
//       {
//         name: 'オムライス弁当',
//         description: 'ふわトロ卵のオムライス弁当。',
//         currentPrice: 680,
//         currentCost: 408,
//         category: '洋食',
//         isActive: true,
//       },
//       {
//         name: 'とんかつ弁当',
//         description: 'サクサクとんかつの定番弁当。',
//         currentPrice: 800,
//         currentCost: 480,
//         category: '和食',
//         isActive: true,
//       },
//     ]

//     // 配達チームデータ
//     const teams = [
//       {
//         name: 'チーム A',
//         driverName: '配達員 山田',
//         vehicleInfo: '軽トラック（品川100あ1234）',
//         capacity: 50,
//         isActive: true,
//       },
//       {
//         name: 'チーム B',
//         driverName: '配達員 田中',
//         vehicleInfo: 'バン（品川200い5678）',
//         capacity: 80,
//         isActive: true,
//       },
//       {
//         name: 'チーム C',
//         driverName: '配達員 佐藤',
//         vehicleInfo: '軽トラック（品川300う9012）',
//         capacity: 45,
//         isActive: true,
//       },
//     ]

//     // データベースに挿入
//     const createdCustomers = await Promise.all(customers.map(customer => prisma.sbmCustomer.create({data: customer})))

//     const createdProducts = await Promise.all(
//       products.map(product =>
//         prisma.sbmProduct.create({
//           data: {
//             ...product,
//             SbmProductPriceHistory: {
//               create: {
//                 productId: '1', // 仮の値、後で更新
//                 price: product.currentPrice,
//                 cost: product.currentCost,
//                 effectiveDate: new Date(),
//               },
//             },
//           },
//         })
//       )
//     )

//     // 価格履歴のproductIdを正しい値で更新
//     for (const product of createdProducts) {
//       await prisma.sbmProductPriceHistory.updateMany({
//         where: {sbmProductId: product.id},
//         data: {productId: product.id.toString()},
//       })
//     }

//     const createdTeams = await Promise.all(teams.map(team => prisma.sbmDeliveryTeam.create({data: team})))

//     // サンプル予約データ（直近1ヶ月分）
//     const today = new Date()
//     const reservations: any[] = []

//     const staffNames = ['田中太郎', '佐藤花子', '鈴木次郎', '高橋美咲']

//     for (let i = 0; i < 15; i++) {
//       const deliveryDate = new Date(today)
//       deliveryDate.setDate(today.getDate() + Math.floor(Math.random() * 30) - 15) // 過去15日〜未来15日
//       deliveryDate.setHours(12, 0, 0, 0) // 12:00固定

//       const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)]
//       const staff = staffNames[Math.floor(Math.random() * staffNames.length)]

//       // ランダムに1-4個の商品を選択
//       const numItems = Math.floor(Math.random() * 4) + 1
//       const selectedProducts: ReservationItem[] = []
//       for (let j = 0; j < numItems; j++) {
//         const product = createdProducts[Math.floor(Math.random() * createdProducts.length)]
//         const quantity = Math.floor(Math.random() * 10) + 1
//         selectedProducts.push({
//           sbmProductId: product.id,
//           productName: product.name,
//           quantity,
//           unitPrice: product.currentPrice,
//           totalPrice: product.currentPrice * quantity,
//         })
//       }

//       const totalAmount = selectedProducts.reduce((sum, item) => sum + (item?.totalPrice ?? 0), 0)
//       const pointsUsed = Math.floor(Math.random() * Math.min(customer.availablePoints, totalAmount * 0.1))
//       const finalAmount = totalAmount - pointsUsed

//       const purposes = ['会議', '研修', '接待', 'イベント', '懇親会', 'その他']
//       const paymentMethods = ['現金', '銀行振込', '請求書', 'クレジットカード']
//       const orderChannels = ['電話', 'FAX', 'メール', 'Web', '営業', 'その他']
//       const pickupLocations = ['配達', '店舗受取']

//       reservations.push({
//         sbmCustomerId: customer.id,
//         customerName: customer.companyName,
//         contactName: customer.contactName ?? undefined,
//         phoneNumber: customer.phoneNumber,
//         postalCode: customer.postalCode,
//         prefecture: customer.prefecture,
//         city: customer.city,
//         street: customer.street,
//         building: customer.building,
//         deliveryDate,
//         pickupLocation: pickupLocations[Math.floor(Math.random() * pickupLocations.length)] as PickupLocation,
//         purpose: purposes[Math.floor(Math.random() * purposes.length)] as Purpose,
//         paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)] as PaymentMethod,
//         orderChannel: orderChannels[Math.floor(Math.random() * orderChannels.length)] as OrderChannel,
//         totalAmount,
//         pointsUsed,
//         finalAmount,
//         orderStaff: staff,
//         notes: Math.random() > 0.7 ? 'サンプル備考テキスト' : undefined,
//         deliveryCompleted: deliveryDate < today ? Math.random() > 0.2 : false,
//         recoveryCompleted: deliveryDate < today ? Math.random() > 0.3 : false,
//         items: selectedProducts,
//       })
//     }

//     const createdReservations = await Promise.all(
//       reservations.map(reservation =>
//         prisma.sbmReservation.create({
//           data: {
//             sbmCustomerId: reservation.sbmCustomerId,
//             customerName: reservation.customerName,
//             contactName: reservation.contactName,
//             phoneNumber: reservation.phoneNumber,
//             postalCode: reservation.postalCode,
//             prefecture: reservation.prefecture,
//             city: reservation.city,
//             street: reservation.street,
//             building: reservation.building,
//             deliveryDate: reservation.deliveryDate,
//             pickupLocation: reservation.pickupLocation,
//             purpose: reservation.purpose,
//             paymentMethod: reservation.paymentMethod,
//             orderChannel: reservation.orderChannel,
//             totalAmount: reservation.totalAmount,
//             pointsUsed: reservation.pointsUsed,
//             finalAmount: reservation.finalAmount,
//             orderStaff: reservation.orderStaff,
//             userId: reservation.userId,
//             notes: reservation.notes,
//             deliveryCompleted: reservation.deliveryCompleted,
//             recoveryCompleted: reservation.recoveryCompleted,
//             SbmReservationItem: {
//               create: reservation.items.map(item => ({
//                 sbmProductId: item.sbmProductId,
//                 productName: item.productName,
//                 quantity: item.quantity,
//                 unitPrice: item.unitPrice,
//                 totalPrice: item.totalPrice,
//               })),
//             },
//             SbmReservationTask: {
//               create: [
//                 {taskType: 'delivery', isCompleted: reservation.deliveryCompleted},
//                 {taskType: 'recovery', isCompleted: reservation.recoveryCompleted},
//               ],
//             },
//             SbmReservationChangeHistory: {
//               create: {
//                 changedBy: reservation.orderStaff,
//                 changeType: 'create',
//                 newValues: reservation as any,
//               },
//             },
//           },
//         })
//       )
//     )

//     revalidatePath('/sbm')
//     return {
//       success: true,
//       data: {
//         counts: {
//           customers: createdCustomers.length,
//           products: createdProducts.length,
//           teams: createdTeams.length,
//           reservations: createdReservations.length,
//         },
//       },
//     }
//   } catch (error) {
//     console.error('Seed error:', error)
//     return {success: false, error: 'シード処理に失敗しました'}
//   }
// }

// // データベースクリア
// export async function clearDatabase() {
//   try {
//     // リレーションを考慮した順序で削除
//     await prisma.sbmReservationChangeHistory.deleteMany()
//     await prisma.sbmReservationTask.deleteMany()
//     await prisma.sbmReservationItem.deleteMany()
//     await prisma.sbmDeliveryAssignment.deleteMany()
//     await prisma.sbmReservation.deleteMany()
//     await prisma.sbmRfmAnalysis.deleteMany()
//     await prisma.sbmProductPriceHistory.deleteMany()
//     await prisma.sbmProduct.deleteMany()
//     await prisma.sbmDeliveryTeam.deleteMany()
//     await prisma.sbmCustomer.deleteMany()

//     revalidatePath('/sbm')
//     return {success: true}
//   } catch (error) {
//     console.error('Clear database error:', error)
//     return {success: false, error: 'データベースクリアに失敗しました'}
//   }
// }

// // データベースステータス確認
// export async function checkDatabaseStatus() {
//   try {
//     const [customers, products, reservations, teams] = await Promise.all([
//       prisma.sbmCustomer.count(),
//       prisma.sbmProduct.count(),
//       prisma.sbmReservation.count(),
//       prisma.sbmDeliveryTeam.count(),
//     ])

//     return {
//       customers,
//       products,
//       users: 0, // Userモデルがないため0
//       reservations,
//       teams,
//     }
//   } catch (error) {
//     console.error('Status check error:', error)
//     return {
//       customers: 0,
//       products: 0,
//       users: 0,
//       reservations: 0,
//       teams: 0,
//     }
//   }
// }

// // データエクスポート
// export async function exportData() {
//   try {
//     const [customers, products, teams, reservations] = await Promise.all([
//       prisma.sbmCustomer.findMany({include: {SbmReservation: true, SbmRfmAnalysis: true}}),
//       prisma.sbmProduct.findMany({include: {SbmProductPriceHistory: true, SbmReservationItem: true}}),
//       prisma.sbmDeliveryTeam.findMany({include: {deliveryAssignments: true}}),
//       prisma.sbmReservation.findMany({
//         include: {
//           SbmReservationItem: true,
//           SbmReservationTask: true,
//           SbmReservationChangeHistory: true,
//           SbmDeliveryAssignment: true,
//         },
//       }),
//     ])

//     const exportData = {
//       exportDate: new Date().toISOString(),
//       version: '1.0',
//       data: {
//         customers,
//         products,
//         teams,
//         reservations,
//       },
//     }

//     return {success: true, data: exportData}
//   } catch (error) {
//     console.error('Export error:', error)
//     return {success: false, error: 'データエクスポートに失敗しました'}
//   }
// }

// // データインポート
// export async function importData(importData: any) {
//   try {
//     if (!importData.data) {
//       return {success: false, error: '無効なデータ形式です'}
//     }

//     // まずデータをクリア
//     await clearDatabase()

//     const {customers, products, teams, reservations} = importData.data

//     // 顧客データをインポート
//     if (customers?.length > 0) {
//       await Promise.all(
//         customers.map((customer: any) =>
//           prisma.sbmCustomer.create({
//             data: {
//               companyName: customer.companyName,
//               contactName: customer.contactName,
//               phoneNumber: customer.phoneNumber,
//               postalCode: customer.postalCode,
//               prefecture: customer.prefecture,
//               city: customer.city,
//               street: customer.street,
//               building: customer.building,
//               email: customer.email,
//               availablePoints: customer.availablePoints,
//               notes: customer.notes,
//               createdAt: new Date(customer.createdAt),
//               updatedAt: new Date(customer.updatedAt),
//             },
//           })
//         )
//       )
//     }

//     // 商品データをインポート
//     if (products?.length > 0) {
//       await Promise.all(
//         products.map((product: any) =>
//           prisma.sbmProduct.create({
//             data: {
//               name: product.name,
//               description: product.description,
//               currentPrice: product.currentPrice,
//               currentCost: product.currentCost,
//               category: product.category,
//               isActive: product.isActive,
//               createdAt: new Date(product.createdAt),
//               updatedAt: new Date(product.updatedAt),
//               SbmProductPriceHistory: {
//                 create:
//                   product.SbmProductPriceHistory?.map((history: any) => ({
//                     productId: history.productId,
//                     price: history.price,
//                     cost: history.cost,
//                     effectiveDate: new Date(history.effectiveDate),
//                     createdAt: new Date(history.createdAt),
//                   })) || [],
//               },
//             },
//           })
//         )
//       )
//     }

//     // チームデータをインポート
//     if (teams?.length > 0) {
//       await Promise.all(
//         teams.map((team: any) =>
//           prisma.sbmDeliveryTeam.create({
//             data: {
//               name: team.name,
//               driverName: team.driverName,
//               vehicleInfo: team.vehicleInfo,
//               capacity: team.capacity,
//               isActive: team.isActive,
//               createdAt: new Date(team.createdAt),
//               updatedAt: new Date(team.updatedAt),
//             },
//           })
//         )
//       )
//     }

//     // 予約データをインポート
//     if (reservations?.length > 0) {
//       await Promise.all(
//         reservations.map((reservation: any) =>
//           prisma.sbmReservation.create({
//             data: {
//               sbmCustomerId: reservation.sbmCustomerId,
//               customerName: reservation.customerName,
//               contactName: reservation.contactName,
//               phoneNumber: reservation.phoneNumber,
//               postalCode: reservation.postalCode,
//               prefecture: reservation.prefecture,
//               city: reservation.city,
//               street: reservation.street,
//               building: reservation.building,
//               deliveryDate: new Date(reservation.deliveryDate),
//               pickupLocation: reservation.pickupLocation,
//               purpose: reservation.purpose,
//               paymentMethod: reservation.paymentMethod,
//               orderChannel: reservation.orderChannel,
//               totalAmount: reservation.totalAmount,
//               pointsUsed: reservation.pointsUsed,
//               finalAmount: reservation.finalAmount,
//               orderStaff: reservation.orderStaff,
//               userId: reservation.userId,
//               notes: reservation.notes,
//               deliveryCompleted: reservation.deliveryCompleted,
//               recoveryCompleted: reservation.recoveryCompleted,
//               createdAt: new Date(reservation.createdAt),
//               updatedAt: new Date(reservation.updatedAt),
//               SbmReservationItem: {
//                 create:
//                   reservation.SbmReservationItem?.map((item: any) => ({
//                     sbmProductId: item.sbmProductId,
//                     productName: item.productName,
//                     quantity: item.quantity,
//                     unitPrice: item.unitPrice,
//                     totalPrice: item.totalPrice,
//                     createdAt: new Date(item.createdAt),
//                   })) || [],
//               },
//               SbmReservationTask: {
//                 create:
//                   reservation.SbmReservationTask?.map((task: any) => ({
//                     taskType: task.taskType,
//                     isCompleted: task.isCompleted,
//                     completedAt: task.completedAt ? new Date(task.completedAt) : null,
//                     notes: task.notes,
//                     createdAt: new Date(task.createdAt),
//                     updatedAt: new Date(task.updatedAt),
//                   })) || [],
//               },
//               SbmReservationChangeHistory: {
//                 create:
//                   reservation.SbmReservationChangeHistory?.map((history: any) => ({
//                     changedBy: history.changedBy,
//                     changeType: history.changeType,
//                     changedFields: history.changedFields,
//                     oldValues: history.oldValues,
//                     newValues: history.newValues,
//                     changedAt: new Date(history.changedAt),
//                   })) || [],
//               },
//             },
//           })
//         )
//       )
//     }

//     revalidatePath('/sbm')
//     return {success: true}
//   } catch (error) {
//     console.error('Import error:', error)
//     return {success: false, error: 'データインポートに失敗しました'}
//   }
// }
