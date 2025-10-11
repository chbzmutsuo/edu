import {obj__initializeProperty} from '@cm/class/ObjHandler/transformers'
import {prismaSchemaString, prismaDMMF} from '@cm/lib/methods/scheme-json-export'

/**
 * スキーマをオブジェクト形式で取得する
 * DMMFデータを使用した新しい実装
 */
export const getSchema = () => {
  const schemaAsObj = {}

  // DMMFが利用可能な場合はそちらを使用
  if (prismaDMMF && prismaDMMF.models) {
    prismaDMMF.models.forEach(model => {
      schemaAsObj[model.name] = model.fields.map(field => {
        // フィールド情報を文字列形式に変換（後方互換性のため）
        const isArray = field.isList ? '[]' : ''
        const isOptional = !field.isRequired ? '?' : ''
        return `  ${field.name}${isOptional} ${field.type}${isArray}`
      })
    })
    return schemaAsObj
  }

  // フォールバック: 従来の文字列解析方式
  const schemaAsStr = prismaSchemaString
  let modelName = ''
  schemaAsStr.split('\n').forEach(line => {
    if (line.includes('model') && line.includes('{')) {
      modelName = line.split(' ').filter(val => val)[1]
    }
    if (line.includes('}') || line.includes('{') || !line) {
      return
    }

    obj__initializeProperty(schemaAsObj, modelName, [])
    schemaAsObj[modelName].push(line)
  })

  return schemaAsObj
}

/**
 * リレーショナルモデルを取得する
 * DMMFデータを使用した改善版
 */
export const getRelationalModels = ({schemaAsObj, parentName}) => {
  parentName = parentName[0].toUpperCase() + parentName.slice(1)

  type attribute = {
    name: string
    type: string | null
    relationalType: string | null
  }

  const singleAttributeObj: {[key: string]: attribute} = {}
  const hasManyAttributeObj: {[key: string]: attribute} = {}
  const hasOneAttributeObj: {[key: string]: attribute} = {}

  // DMMFが利用可能な場合はそちらを使用
  if (prismaDMMF && prismaDMMF.models) {
    const model = prismaDMMF.models.find(m => m.name === parentName)

    if (model) {
      model.fields.forEach(field => {
        const {name, kind, type, isList, relationName} = field

        // リレーションフィールド（kind === 'object'）
        if (kind === 'object') {
          if (isList) {
            hasManyAttributeObj[name] = {name, type, relationalType: 'hasMany'}
          } else {
            hasOneAttributeObj[name] = {name, type, relationalType: 'hasOne'}
          }
        }
        // スカラーフィールド
        else if (kind === 'scalar' || kind === 'enum') {
          singleAttributeObj[name] = {name, type, relationalType: null}
        }
      })

      return {singleAttributeObj, hasManyAttributeObj, hasOneAttributeObj}
    }
  }

  // フォールバック: 従来の文字列解析方式
  const attributes = schemaAsObj[parentName]

  attributes?.forEach(line => {
    const foo = line.split(' ').filter(val => val)
    const [name, type] = foo

    if (String(name?.[0])?.match(/[A-Z]/)) {
      if (type.includes('[]')) {
        hasManyAttributeObj[name] = {name, type: null, relationalType: 'hasMany'}
      } else {
        hasOneAttributeObj[name] = {name, type: null, relationalType: 'hasOne'}
      }
    } else {
      singleAttributeObj[name] = {name, type, relationalType: null}
    }
  })

  return {singleAttributeObj, hasManyAttributeObj, hasOneAttributeObj}
}

/**
 * DMMFから直接モデル情報を取得するヘルパー関数
 */
export const getDMMFModel = (modelName: string) => {
  if (!prismaDMMF || !prismaDMMF.models) return null
  return prismaDMMF.models.find(m => m.name === modelName)
}

/**
 * すべてのモデル名を取得
 */
export const getAllModelNames = (): string[] => {
  if (prismaDMMF && prismaDMMF.models) {
    return prismaDMMF.models.map(m => m.name)
  }
  return Object.keys(getSchema())
}
