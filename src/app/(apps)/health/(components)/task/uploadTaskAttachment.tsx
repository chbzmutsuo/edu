import {basePath} from '@lib/methods/common'

// ファイルアップロード
export const uploadTaskAttachment = async ({taskId, file}: {taskId: number; file: File}) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('taskId', taskId.toString())

    const response = await fetch(`${basePath}/health/api/task/${taskId}/attachment`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    console.log(result) //logs

    if (!response.ok) {
      return {success: false, error: result.error || 'ファイルのアップロードに失敗しました'}
    }

    return {success: true, data: result.data}
  } catch (error) {
    console.error('ファイルアップロードエラー:', error)
    return {success: false, error: 'ファイルのアップロードに失敗しました'}
  }
}
