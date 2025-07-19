import {doTransaction, transactionQuery} from '@cm/lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'
import {NextRequest, NextResponse} from 'next/server'

export const POST = async (req: NextRequest) => {
  const transactionQueryList: transactionQuery[] = []

  const header = items.splice(0, 1)
  items.forEach((item, i) => {
    const [id, name, category, price, cost, taxType] = item
    const payload: Prisma.AqProductUpsertArgs = {
      where: {name},
      create: {
        name,
        // price: parseInt(price.replace(/,/g, '')),
        cost: parseInt(cost.replace(/,/g, '')),
        // taxType,
      },
      update: {
        name,
        // price: parseInt(price.replace(/,/g, '')),
        cost: parseInt(cost.replace(/,/g, '')),
        // taxType,
      },
    }

    transactionQueryList.push({
      model: `aqProduct`,
      method: 'upsert',
      queryObject: payload,
    })
  })
  const res = await doTransaction({transactionQueryList})

  return NextResponse.json(res)
}

const items = [
  ['56', 'MERCURY 水素水サーバー入替メンテナンス', '水素水', '6,600', '0', '6,600', '10%'],
  ['80', 'SnowDispenser NSD-151MW', '花雪氷', '605,000', '286,000', '605,000', '10%'],
  ['81', 'SnowDispenser 訪問調整費', '花雪氷', '44,000', '0', '44,000', '10%'],
  ['16', 'サーバー　廃棄代行', 'メンテナンス', '1,650', '0', '1,650', '10%'],
  ['14', 'サーバー　メンテナンス用予備', '水（県内）', '0', '0', '0', '0%'],
  ['11', 'サーバー使用料（便利プラン）', '水（県内）', '1,100', '0', '1,100', '10%'],
  ['12', 'サーバー使用料（楽々プラン）', '水（県内）', '550', '0', '550', '10%'],
  ['13', 'サーバー　定期メンテナンス', '水（県内）', '0', '0', '0', '0%'],
  ['15', 'サーバー　新規設置用', '水（県内）', '0', '0', '0', '0%'],
  ['58', 'パーツ洗浄 セパレート　個別梱包', 'メンテナンス', '352', '220', '352', '10%'],
  ['57', 'サーバーパーツ洗浄 ドリップトレー', 'メンテナンス', '418', '220', '418', '10%'],
  ['51', 'メンテナンス 仕上り', 'メンテナンス', '3,520', '1,925', '3,520', '10%'],
  ['53', 'メンテナンス 仕上り 水素浄水器', 'メンテナンス', '4,180', '2,310', '4,180', '10%'],
]
