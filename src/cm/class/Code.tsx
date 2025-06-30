export type codeItemContent = {
  label: string
  color?: string
  onCreate?: boolean
}
export type codeItem = {code: string} & codeItemContent
export type codeObjectArgs = {[key: string]: codeItemContent}

export class Code {
  codeObject: {[key: string]: codeItem}
  // array: codeItemContent[]
  constructor(master: codeObjectArgs) {
    this.codeObject = Object.keys(master).reduce((acc, key) => {
      acc[key] = {...master[key], code: key}
      return acc
    }, {})
  }

  get array() {
    return Object.values(this.codeObject)
  }

  findByLabel(label: string) {
    const hit = this.array.find(item => item.label === label)
    if (hit) {
      return hit
    }
    throw new Error(`${label} は見つかりませんでした`)
  }

  findByCode(code: string) {
    const toObj = this.codeObject
    const hit = toObj[code]
    if (hit) {
      return hit
    }
    throw new Error(`${code} は見つかりませんでした`)
  }
}
