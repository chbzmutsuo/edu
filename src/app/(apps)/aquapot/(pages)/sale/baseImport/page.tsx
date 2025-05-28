'use client'
// import {Days} from '@class/Days/Days'
// import {getMidnight, new Date} from '@class/Days/date-utils/calculations'

import {Button} from '@components/styles/common-components/Button'
import {C_Stack, Center, Padding} from '@components/styles/common-components/common-components'
import {CsvTable} from '@components/styles/common-components/CsvTable/CsvTable'
import useGlobal from '@hooks/globalHooks/useGlobal'
import useFileUploadPropsOptimized from '@hooks/useFileUpload/useFileUploadPropsOptimized'
import {createUpdate} from '@lib/methods/createUpdate'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {Prisma} from '@prisma/client'

import React from 'react'
import {toast} from 'react-toastify'

// BASEのスプレッドシートURL
const sheetUrl = 'https://docs.google.com/spreadsheets/d/1jr1BCd9gXaK6EYK0VCKWWLqjC66nDP_ws7HpAwN1XKU/edit?gid=0#gid=0'
export default function Page(props) {
  // CSVファイルのヘッダー定義
  const header = [
    `注文ID`,
    `注文日時`,
    `氏_請求先`,
    `名_請求先`,
    `郵便番号_請求先`,
    `都道府県_請求先`,
    `住所_請求先`,
    `住所2_請求先`,
    `電話番号_請求先`,
    `メールアドレス_請求先`,
    `氏_配送先`,
    `名_配送先`,
    `郵便番号_配送先`,
    `都道府県_配送先`,
    `住所_配送先`,
    `住所2_配送先`,
    `電話番号_配送先`,
    `備考`,
    `商品名`,
    `バリエーション`,
    `価格`,
    `税率`,
    `数量`,
    `合計金額`,
    `送料`,
    `支払い方法`,
    `代引き手数料`,
    `発送状況`,
    `商品ID`,
    `種類ID`,
    `購入元`,
    `配送日`,
    `配送時間帯`,
    `注文メモ`,
    `調整金額`,
  ]
  // ローディング状態を管理するフック
  const {toggleLoad} = useGlobal()

  // ファイルアップロード用のフック
  const {
    fileArrState,
    fileErrorState,
    component: {FileUploaderMemo},
  } = useFileUploadPropsOptimized({
    charset: 'shift-jis',
    accept: {'text/csv': ['.csv']}, // CSVファイルのみ受け付ける
    readAs: 'readAsText', // テキストとして読み込む
  })

  // アップロードされたCSVデータ
  const csvArray = fileArrState?.[0]?.fileContent

  const body: any[] = (csvArray?.slice(1) ?? []).filter(item => item[0])

  return (
    <Center>
      <Padding>
        <C_Stack className={` items-center gap-[60px]`}>
          <span>最新のBASE売上データをインポートしてください。</span>
          {/* ファイルアップロードコンポーネント */}
          {FileUploaderMemo}
          <div>
            {csvArray && (
              <div>
                <Button
                  onClick={async item => {
                    // ローディング状態でデータ処理を実行
                    toggleLoad(async item => {
                      const array = csvArray as any[]
                      if (array) {
                        // CSVデータをオブジェクトの配列に変換（ヘッダー行を除く）
                        const values = body.map((item, i) => {
                          return Object.fromEntries(header.map((key, i) => [key, item[i]]))
                        })

                        // 注文IDごとにデータをグループ化
                        const OrderIdList = values.reduce((acc, item) => {
                          acc[item.注文ID] = [...(acc[item.注文ID] ?? []), item]
                          return acc
                        }, {})

                        // 各注文IDに対して処理を実行
                        await Promise.all(
                          Object.entries(OrderIdList).map(async ([orderId, rows]) => {
                            // カート情報のupsert用データ準備
                            const cartData: Prisma.AqSaleCartUpsertArgs = {
                              where: {baseOrderId: orderId},
                              create: {
                                baseOrderId: orderId,
                                date: new Date(rows[0].注文日時),
                                paymentMethod: rows[0].支払い方法,
                                aqCustomerId: 0, // 仮の顧客ID（後で更新）
                              },
                              update: {
                                baseOrderId: orderId,
                                date: new Date(rows[0].注文日時),
                                paymentMethod: rows[0].支払い方法,
                                aqCustomerId: 0, // 仮の顧客ID（後で更新）
                              },
                            }

                            // 各商品行に対して処理を実行
                            const payloadArray = await Promise.all(
                              rows.map(async row => {
                                // 行データの分割代入
                                const {
                                  注文ID,
                                  注文日時,
                                  氏_請求先,
                                  名_請求先,
                                  郵便番号_請求先,
                                  都道府県_請求先,
                                  住所_請求先,
                                  住所2_請求先,
                                  電話番号_請求先,
                                  メールアドレス_請求先,
                                  氏_配送先,
                                  名_配送先,
                                  郵便番号_配送先,
                                  都道府県_配送先,
                                  住所_配送先,
                                  住所2_配送先,
                                  電話番号_配送先,
                                  備考,
                                  商品名,
                                  バリエーション,
                                  価格,
                                  税率,
                                  数量,
                                  合計金額,
                                  送料,
                                  支払い方法,
                                  代引き手数料,
                                  発送状況,
                                  商品ID,
                                  種類ID,
                                  購入元,
                                  配送日,
                                  配送時間帯,
                                  注文メモ,
                                  調整金額,
                                } = row

                                // 顧客名の生成
                                const name = (氏_請求先 || 名_請求先) && [氏_請求先, 名_請求先].join(' ')

                                // 顧客情報の登録または更新
                                const customerRes = await doStandardPrisma(`aqCustomer`, `upsert`, {
                                  where: {email: メールアドレス_請求先},
                                  ...createUpdate({
                                    name,
                                    postal: 郵便番号_請求先,
                                    state: 都道府県_請求先,
                                    city: 住所_請求先,
                                    street: 住所2_請求先,
                                    tel: 電話番号_請求先,
                                    email: メールアドレス_請求先,
                                    fromBase: true, // BASEからのデータであることを示す
                                  }),
                                })

                                // 商品情報の登録または更新
                                const productRes = await doStandardPrisma(`aqProduct`, `upsert`, {
                                  where: {name: 商品名},
                                  ...createUpdate({name: 商品名, cost: 0, fromBase: true}),
                                })

                                // カートデータの顧客ID更新
                                cartData.create = {
                                  baseOrderId: 注文ID,
                                  date: new Date(注文日時),
                                  paymentMethod: 'BASE',
                                  aqCustomerId: customerRes.result.id,
                                }
                                cartData.update = {
                                  baseOrderId: 注文ID,
                                  date: new Date(注文日時),
                                  paymentMethod: 'BASE',
                                  aqCustomerId: customerRes.result.id,
                                }

                                // 税率の計算
                                const taxRate = 税率 === `標準税率` ? 1.1 : 税率 === `軽減税率` ? 1.08 : 1
                                // 税抜価格の計算（四捨五入）
                                const price = Math.round(Number(価格) / Number(taxRate))

                                // 売上レコード用のデータ作成
                                const payload = {
                                  baseSaleRecordId: [注文ID, 商品ID, 種類ID].join(`_`), // ユニークID生成
                                  date: new Date(注文日時),
                                  aqCustomerId: customerRes.result.id,
                                  quantity: Number(数量),
                                  price: price ?? 0,
                                  taxRate: taxRate,
                                  taxedPrice: Number(合計金額),
                                  remarks: [`BASE売上`, 備考].join(`\n`),
                                  aqProductId: productRes.result.id,
                                }
                                return payload
                              })
                            )

                            const payment = cartData.create.paymentMethod

                            if (payment) {
                              // カートと売上レコードの登録

                              try {
                                const res = await doStandardPrisma(`aqSaleCart`, `upsert`, {
                                  where: cartData.where,
                                  create: {
                                    ...cartData.create,
                                    AqSaleRecord: {createMany: {data: payloadArray}},
                                  },
                                  update: {
                                    ...cartData.update,
                                    // AqSaleRecord: {createMany: {data: payloadArray}},
                                  },
                                })
                              } catch (error) {
                                console.error(error) //////////
                              }
                            }
                          })
                        )
                      } else {
                        // データがない場合はエラー表示
                        toast.error(`データ連携に失敗しました。`)
                      }
                    })
                  }}
                >
                  取り込み
                </Button>
              </div>
            )}
          </div>

          <>
            {CsvTable({
              records: (body ?? []).map(item => {
                return {
                  csvTableRow: header.map((head, i) => {
                    const data = item[i]
                    return {
                      label: head,
                      cellValue: data,
                      style: {minWidth: 100, fontSize: 10},
                    }
                  }),
                }
              }),
            }).WithWrapper({})}
          </>
        </C_Stack>
      </Padding>
    </Center>
  )
}
