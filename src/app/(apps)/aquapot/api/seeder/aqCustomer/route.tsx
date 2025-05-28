import {doTransaction, transactionQuery} from '@lib/server-actions/common-server-actions/doTransaction/doTransaction'
import {Prisma} from '@prisma/client'
import {NextRequest, NextResponse} from 'next/server'

export const POST = async (req: NextRequest) => {
  const transactionQueryList: transactionQuery[] = []

  const header = items.splice(0, 1)
  items.forEach((item, i) => {
    const {name, email, tel} = item
    const payload: Prisma.AqCustomerUpsertArgs = {
      where: {name},
      create: {name, email, tel},
      update: {name, email, tel},
    }

    transactionQueryList.push({
      model: `aqCustomer`,
      method: 'upsert',
      queryObject: payload,
    })
  })
  const res = await doTransaction({transactionQueryList})

  return NextResponse.json(res)
}

const items = [
  {
    name: '株式会社新井酒店 御中',
    email: 'araisaketen@star.ocn.ne.jp',
    tel: '0272246561',
    TotalSpent: '¥3,310,938',
    PointsBalance: 0,
  },
  {
    name: '有限会社エア 様',
    email: '担当 諸田 様, ea@eawater.net',
    tel: '0279593215',
    TotalSpent: '¥2,707,012',
    PointsBalance: 0,
  },
  {
    name: '株式会社フォレストコーポレーション 様',
    email: 'toru0905forest@gmail.com',
    tel: '0276202012',
    TotalSpent: '¥2,493,040',
    PointsBalance: 0,
  },
  {
    name: '有限会社半田屋 様',
    email: 'handaya.come@gmail.com',
    tel: '0277450147',
    TotalSpent: '¥1,481,594',
    PointsBalance: 0,
  },
  {
    name: 'ソネット株式会社 様',
    email: 'keiri@sonnette.biz',
    tel: '0272514413',
    TotalSpent: '¥1,447,200',
    PointsBalance: 0,
  },
  {
    name: 'CASABLANCA Eletroshop 様',
    email: 'sandro@eletroshopjp.com',
    tel: '',
    TotalSpent: '¥1,255,910',
    PointsBalance: 0,
  },
  {
    name: '有限会社小金 様',
    email: '担当者:取締役お客様サポート 小林久子様、納入担当:細島様, kogane@mth.biglobe.ne.jp',
    tel: '0273254411',
    TotalSpent: '¥1,253,120',
    PointsBalance: 0,
  },
  {
    name: '有限会社ライズ 様',
    email: 'masahiro0815@mist.ocn.ne.jp',
    tel: '',
    TotalSpent: '¥1,194,652',
    PointsBalance: 0,
  },
  {
    name: '群馬県高等学校野球連盟（敷島球場）',
    email: '—',
    tel: '',
    TotalSpent: '¥1,191,607',
    PointsBalance: 0,
  },
  {
    name: '有限会社アクアポット 御中',
    email: 'info@aquapot.jp',
    tel: '',
    TotalSpent: '¥1,191,245',
    PointsBalance: 0,
  },
]
