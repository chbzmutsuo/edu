import {isApiAccessAllowed} from 'src/non-common/serverSideFunction'
import {anyObject} from '@cm/types/types'
export const config = {
  api: {
    responseLimit: '8mb',
  },
}

export type outerFetchApiBodyType = {
  endpoint: string
  postPrams?: anyObject
  resHandleMode?: 'text' | 'json' | 'arrayBuffer'
}

export default async function OuterFetchApi(req, res) {
  const isAllowed = await isApiAccessAllowed({req, res})
  if (isAllowed) {
    const body: outerFetchApiBodyType = req.body
    const {endpoint, postPrams, resHandleMode = 'json'} = body

    //処理の実行
    try {
      const fetchres = await fetch(endpoint, postPrams)
        .then(async res => {
          if (resHandleMode === 'arrayBuffer') {
            return res.arrayBuffer()
          } else if (resHandleMode === 'json') {
            return res.json()
          } else {
            return await res.text()
          }
        })
        .then(res => {
          return res
        })
        .catch(error => {
          console.info(error)
        })

      const result = fetchres

      return res.json({success: true, result, message: `データを取得しました`})

      // 必要に応じてdataを処理
    } catch (error) {
      console.error(error)
      return res.status(500).json({success: false, message: `API接続に失敗しました`, error: error.message})
    }
  }
}
