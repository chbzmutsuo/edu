import {PrismaClient} from '@prisma/client'
import {prismaMethodType, PrismaModelNames} from '@cm/types/prisma-types'
import {anyObject} from '@cm/types/types'
import {isDev} from '@lib/methods/common'

let prisma

// グローバルスコープにPrisma Clientを設定
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // 開発環境では、global.prismaにインスタンスがすでにあれば再利用し、なければ新規作成
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma as PrismaClient

export const createMessage = ({model, method}) => {
  //最初の文字を小文字に
  model = model.charAt(0).toLowerCase() + model.slice(1)

  /**全てのキーは指定しなくても良いようにしたい */

  const modelObj: {[key in PrismaModelNames]?: string} = {
    user: 'ユーザー',
  }

  const messageObj: {[key in prismaMethodType]?: string} = {
    findMany: `の一覧を取得しました`,
    findUnique: `の詳細を取得しました`,
    upsert: `を更新しました`,
    delete: `を削除しました`,
    update: `を更新しました`,
    create: `を作成しました`,
    transaction: 'を更新しました',
  }

  const message = `${modelObj[model] ?? 'データ'} ${messageObj[method] ?? method}`
  return message
}

export const handlePrismaError: (error: anyObject) => string = error => {
  let errorMessage = 'Error (causes undetected)'
  const {code, meta} = error
  if (code) {
    const target = meta?.target ?? []

    switch (code) {
      case 'P2025': {
        const extractModelName = (message: string): string | null => {
          const regex = /No '(\w+)' record\(s\)/
          const match = regex.exec(message)
          return match ? match[1] : null
        }

        const modelName = extractModelName(error.message)

        errorMessage = `必要なレコードが見つかりませんでした:【${modelName}】`
        break
      }
      case 'P2002': {
        const doubledKeys = target
          .map(key => {
            const label = columnLabels[key] ?? key
            return `【${label}】`
          })
          .join(`・`)
        errorMessage = isDev
          ? `データ重複エラー: ${doubledKeys}`
          : `データ重複エラー
        `
        break
      }

      case 'P2003': {
        const [modelA, modelB] = meta?.field_name.split(`_`)
        errorMessage = `外部キー制約エラー: (${[modelA, modelB].join(`, `)})`

        break
      }
      default: {
        errorMessage = code ? `[${code}]Prismaで予期しないエラーが発生しました。` : 'Prismaで予期しないエラーが発生しました。'
      }
    }
  } else {
    ;(() => {
      const regex = /Argument `(.+)`: Invalid value provided. Expected (.+), provided (.+)./g
      const matches = regex.exec(error.message)
      if (matches) {
        const [, key, expected, provided] = matches
        errorMessage = `${key}は${expected}型でなければなりません。`
      }
    })()
    ;(() => {
      // Argument `name` is missing.
      const regex = /Argument `(.+)` is missing./g
      const matches = regex.exec(error.message)
      if (matches) {
        const [, key] = matches
        errorMessage = `${key}は必ず入力してください`
      }
    })()
  }

  return errorMessage
  /** */
}

export const columnLabels = {}

export const commonOmit = {
  updatedAt: true,
}
