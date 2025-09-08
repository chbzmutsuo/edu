// 'use client'

// import React, {useState} from 'react'
// import {Database, Play, Trash2, CheckCircle, AlertTriangle, Download, Upload} from 'lucide-react'
// import {seedDatabase, clearDatabase, checkDatabaseStatus, exportData, importData} from '../../(builders)/seedActions'

// export default function SeedPage() {
//   const [loading, setLoading] = useState(false)
//   const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
//   const [message, setMessage] = useState('')
//   const [dbStatus, setDbStatus] = useState<any>(null)

//   const handleSeedDatabase = async () => {
//     setLoading(true)
//     setStatus('idle')
//     try {
//       const result = await seedDatabase()
//       if (result.success) {
//         setStatus('success')
//         setMessage(
//           `データベースに${result.data?.counts ? Object.values(result.data.counts).reduce((a: any, b: any) => a + b, 0) : 0}件のデータを挿入しました`
//         )
//       } else {
//         setStatus('error')
//         setMessage(result.error || 'シードに失敗しました')
//       }
//     } catch (error) {
//       setStatus('error')
//       setMessage('シード処理中にエラーが発生しました')
//     } finally {
//       setLoading(false)
//       checkStatus()
//     }
//   }

//   const handleClearDatabase = async () => {
//     if (!confirm('⚠️ 全てのデータが削除されます。この操作は元に戻せません。実行しますか？')) {
//       return
//     }

//     setLoading(true)
//     setStatus('idle')
//     try {
//       const result = await clearDatabase()
//       if (result.success) {
//         setStatus('success')
//         setMessage('データベースを初期化しました')
//       } else {
//         setStatus('error')
//         setMessage(result.error || 'データ削除に失敗しました')
//       }
//     } catch (error) {
//       setStatus('error')
//       setMessage('データ削除中にエラーが発生しました')
//     } finally {
//       setLoading(false)
//       checkStatus()
//     }
//   }

//   const handleExportData = async () => {
//     setLoading(true)
//     try {
//       const result = await exportData()
//       if (result.success && result.data) {
//         const blob = new Blob([JSON.stringify(result.data, null, 2)], {type: 'application/json'})
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement('a')
//         a.href = url
//         a.download = `sbm-data-export-${new Date().toISOString().split('T')[0]}.json`
//         document.body.appendChild(a)
//         a.click()
//         document.body.removeChild(a)
//         URL.revokeObjectURL(url)
//         setStatus('success')
//         setMessage('データをエクスポートしました')
//       } else {
//         setStatus('error')
//         setMessage('エクスポートに失敗しました')
//       }
//     } catch (error) {
//       setStatus('error')
//       setMessage('エクスポート中にエラーが発生しました')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     setLoading(true)
//     setStatus('idle')
//     try {
//       const text = await file.text()
//       const data = JSON.parse(text)
//       const result = await importData(data)

//       if (result.success) {
//         setStatus('success')
//         setMessage('データをインポートしました')
//       } else {
//         setStatus('error')
//         setMessage(result.error || 'インポートに失敗しました')
//       }
//     } catch (error) {
//       setStatus('error')
//       setMessage('インポート中にエラーが発生しました')
//     } finally {
//       setLoading(false)
//       checkStatus()
//       // ファイル選択をリセット
//       event.target.value = ''
//     }
//   }

//   const checkStatus = async () => {
//     try {
//       const status = await checkDatabaseStatus()
//       setDbStatus(status)
//     } catch (error) {
//       console.error('Status check error:', error)
//     }
//   }

//   React.useEffect(() => {
//     checkStatus()
//   }, [])

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-4xl mx-auto">
//         {/* ヘッダー */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">データベース管理</h1>
//             <p className="text-gray-600">データベースのシード、初期化、バックアップを管理します</p>
//           </div>
//           <Database className="text-blue-600" size={48} />
//         </div>

//         {/* ステータス表示 */}
//         {(status !== 'idle' || message) && (
//           <div
//             className={`mb-6 p-4 rounded-lg border ${
//               status === 'success'
//                 ? 'bg-green-50 border-green-200 text-green-800'
//                 : status === 'error'
//                   ? 'bg-red-50 border-red-200 text-red-800'
//                   : 'bg-blue-50 border-blue-200 text-blue-800'
//             }`}
//           >
//             <div className="flex items-center space-x-2">
//               {status === 'success' && <CheckCircle size={20} />}
//               {status === 'error' && <AlertTriangle size={20} />}
//               <span className="font-medium">{message}</span>
//             </div>
//           </div>
//         )}

//         {/* データベースステータス */}
//         {dbStatus && (
//           <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">データベースステータス</h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="text-2xl font-bold text-blue-600">{dbStatus.customers}</div>
//                 <div className="text-sm text-gray-600">顧客</div>
//               </div>
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="text-2xl font-bold text-green-600">{dbStatus.products}</div>
//                 <div className="text-sm text-gray-600">商品</div>
//               </div>
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="text-2xl font-bold text-purple-600">{dbStatus.users}</div>
//                 <div className="text-sm text-gray-600">ユーザー</div>
//               </div>
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="text-2xl font-bold text-orange-600">{dbStatus.reservations}</div>
//                 <div className="text-sm text-gray-600">予約</div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* シードデータプレビュー */}
//         <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">シードデータ内容</h2>
//           <div className="space-y-4">
//             <div>
//               <h3 className="text-lg font-medium text-gray-800 mb-2">顧客データ（9件）</h3>
//               <div className="text-sm text-gray-600 space-y-2">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="bg-gray-50 p-3 rounded">
//                     <div className="font-semibold">東京都内企業（5件）</div>
//                     <div>千代田区、新宿区、渋谷区、港区、品川区</div>
//                   </div>
//                   <div className="bg-gray-50 p-3 rounded">
//                     <div className="font-semibold">首都圏企業（4件）</div>
//                     <div>神奈川県、埼玉県、千葉県</div>
//                   </div>
//                 </div>
//                 <div className="text-xs text-gray-500">※ 住所は5区分（郵便番号、都道府県、市区町村、町名番地、建物名）で管理</div>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-lg font-medium text-gray-800 mb-2">商品データ（6件）</h3>
//               <div className="text-sm text-gray-600">
//                 <div className="bg-gray-50 p-3 rounded">
//                   和食・洋食の弁当各種（幕の内、唐揚げ、焼き魚、オムライス、とんかつ等）
//                 </div>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-lg font-medium text-gray-800 mb-2">配達チーム（3チーム）</h3>
//               <div className="text-sm text-gray-600">
//                 <div className="bg-gray-50 p-3 rounded">チームA・B・C（配達員、車両情報、配達能力設定済み）</div>
//               </div>
//             </div>

//             <div>
//               <h3 className="text-lg font-medium text-gray-800 mb-2">予約データ（15件）</h3>
//               <div className="text-sm text-gray-600">
//                 <div className="bg-gray-50 p-3 rounded">
//                   過去15日〜未来15日のランダムな予約データ（商品選択、ポイント利用含む）
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* 操作パネル */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* シード操作 */}
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">データシード</h2>
//             <p className="text-gray-600 mb-6">
//               開発・テスト用のサンプルデータを生成します。住所は5区分管理（郵便番号、都道府県、市区町村、町名番地、建物名）で構築されます。既存のデータに追加される形で実行されます。
//             </p>
//             <button
//               onClick={handleSeedDatabase}
//               disabled={loading}
//               className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Play size={20} />
//               <span>{loading ? 'シード実行中...' : 'サンプルデータを生成'}</span>
//             </button>
//           </div>

//           {/* データ初期化 */}
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">データ初期化</h2>
//             <p className="text-gray-600 mb-6">⚠️ 全てのデータを削除します。 本番環境では絶対に実行しないでください。</p>
//             <button
//               onClick={handleClearDatabase}
//               disabled={loading}
//               className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Trash2 size={20} />
//               <span>{loading ? '削除中...' : 'データベースを初期化'}</span>
//             </button>
//           </div>

//           {/* データエクスポート */}
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">データエクスポート</h2>
//             <p className="text-gray-600 mb-6">現在のデータベースの内容をJSONファイルとしてダウンロードします。</p>
//             <button
//               onClick={handleExportData}
//               disabled={loading}
//               className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Download size={20} />
//               <span>{loading ? 'エクスポート中...' : 'データをエクスポート'}</span>
//             </button>
//           </div>

//           {/* データインポート */}
//           <div className="bg-white rounded-lg shadow-sm border p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">データインポート</h2>
//             <p className="text-gray-600 mb-6">JSONファイルからデータを復元します。 既存のデータは上書きされます。</p>
//             <div className="relative">
//               <input
//                 type="file"
//                 accept=".json"
//                 onChange={handleImportData}
//                 disabled={loading}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
//               />
//               <button
//                 disabled={loading}
//                 className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <Upload size={20} />
//                 <span>{loading ? 'インポート中...' : 'ファイルを選択してインポート'}</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* 注意事項 */}
//         <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//           <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ 重要な注意事項</h3>
//           <ul className="text-yellow-700 space-y-1 list-disc list-inside">
//             <li>本番環境では「データ初期化」を絶対に実行しないでください</li>
//             <li>データインポート前には必ずエクスポートでバックアップを取ってください</li>
//             <li>大量データの処理には時間がかかる場合があります</li>
//             <li>処理中はページを閉じないでください</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   )
// }
