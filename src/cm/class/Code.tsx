import {badgeVariantStr} from '@shadcn/lib/variant-types'

export type codeItemCore = {
  code?: string
  label: string
  color?: badgeVariantStr
  colorCode?: string
  approved?: boolean
  onCreate?: boolean
  pending?: boolean
  active?: boolean
}
export type codeItem = {dataKey: string; code: string} & codeItemCore
export type codeObjectArgs = {[key: string]: codeItemCore}

export class Code<T extends codeObjectArgs = codeObjectArgs> {
  raw: {[K in keyof T]: codeItem & T[K]}

  constructor(master: T) {
    this.raw = Object.keys(master).reduce((acc, dataKey) => {
      acc[dataKey as keyof T] = {
        dataKey: dataKey,
        ...master[dataKey],
        code: master[dataKey].code ?? dataKey,
      } as any
      return acc
    }, {} as any)
  }

  get array(): (codeItem & T[keyof T])[] {
    return Object.values(this.raw)
  }

  get toOptionList() {
    return Object.values(this.raw).map(item => ({
      value: item.code,
      label: item.label,
    }))
  }

  getBy(property: keyof codeItem, value: string | boolean): (codeItem & T[keyof T]) | undefined {
    const noPropertyDefined = this.array.every(item => {
      return item[property] === undefined
    })

    if (noPropertyDefined) {
      throw new Error(`${value} は見つかりませんでした`)
    }

    const hit = this.array.find(item => {
      return item[property] === value
    })

    return hit
  }

  byDataKey(dataKey: string) {
    return this.getBy('dataKey', dataKey)
  }

  byLabel(label: string) {
    return this.getBy('label', label)
  }

  byCode(code: string) {
    return this.getBy('code', code)
  }
}
