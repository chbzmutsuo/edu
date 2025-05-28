import Axios from 'src/cm/lib/axios'
import {S3_API_FormData} from '@pages/api/S3'
import {extType, MediaType} from '@cm/types/file-types'
import {requestResultType} from '@cm/types/types'

// 型定義の改善
export interface FileTypeConfig {
  mediaType: MediaType
  ext: extType
  maxSize?: number // バイト単位
  description?: string
}

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  extension: string
  mediaType: MediaType | null
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult extends requestResultType {
  fileInfo?: FileInfo
  uploadTime?: number
}

export interface SendFileToS3Props {
  file: File | null
  formDataObj: S3_API_FormData
  onProgress?: (progress: UploadProgress) => void
  validateFile?: boolean
}

// 定数定義（メモ化対応）
const FILE_TYPE_CONFIGS: readonly FileTypeConfig[] = Object.freeze([
  // 画像ファイル
  {mediaType: 'image/jpeg', ext: '.jpg', maxSize: 10 * 1024 * 1024, description: 'JPEG画像'},
  {mediaType: 'image/png', ext: '.png', maxSize: 10 * 1024 * 1024, description: 'PNG画像'},
  {mediaType: 'image/gif', ext: '.gif', maxSize: 5 * 1024 * 1024, description: 'GIF画像'},
  {mediaType: 'image/bmp', ext: '.bmp', maxSize: 20 * 1024 * 1024, description: 'BMP画像'},
  {mediaType: 'image/tiff', ext: '.tiff', maxSize: 50 * 1024 * 1024, description: 'TIFF画像'},
  {mediaType: 'image/svg+xml', ext: '.svg', maxSize: 1 * 1024 * 1024, description: 'SVG画像'},

  // 動画ファイル
  {mediaType: 'video/quicktime', ext: '.mov', maxSize: 100 * 1024 * 1024, description: 'QuickTime動画'},
  {mediaType: 'video/mp4', ext: '.mp4', maxSize: 100 * 1024 * 1024, description: 'MP4動画'},
  {mediaType: 'video/webm', ext: '.webm', maxSize: 100 * 1024 * 1024, description: 'WebM動画'},

  // 音声ファイル
  {mediaType: 'audio/mpeg', ext: '.mp3', maxSize: 20 * 1024 * 1024, description: 'MP3音声'},
  {mediaType: 'audio/ogg', ext: '.ogg', maxSize: 20 * 1024 * 1024, description: 'OGG音声'},

  // ドキュメント
  {mediaType: 'text/plain', ext: '.txt', maxSize: 1 * 1024 * 1024, description: 'テキストファイル'},
  {mediaType: 'application/pdf', ext: '.pdf', maxSize: 50 * 1024 * 1024, description: 'PDFドキュメント'},
  {mediaType: 'application/json', ext: '.json', maxSize: 1 * 1024 * 1024, description: 'JSONファイル'},
  {mediaType: 'application/xml', ext: '.xml', maxSize: 1 * 1024 * 1024, description: 'XMLファイル'},
  {mediaType: 'text/html', ext: '.html', maxSize: 1 * 1024 * 1024, description: 'HTMLファイル'},
  {mediaType: 'text/css', ext: '.css', maxSize: 1 * 1024 * 1024, description: 'CSSファイル'},
] as const)

// ユーティリティ関数
const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex !== -1 ? filename.slice(lastDotIndex).toLowerCase() : ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isValidFile = (file: any): file is File => {
  return file instanceof File && typeof file.name === 'string' && typeof file.size === 'number' && typeof file.type === 'string'
}

// ファイル名の安全性チェック用の正規表現
// eslint-disable-next-line no-control-regex
const UNSAFE_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1f]/

// または行ごとに無効化
const unsafeChars = /[<>:"/\\|?*\x00-\x1f]/ // eslint-disable-line no-control-regex

export class FileHandler {
  /**
   * サポートされているファイル形式一覧（読み取り専用）
   */
  static get mediaTypes(): readonly FileTypeConfig[] {
    return FILE_TYPE_CONFIGS
  }

  /**
   * ファイル情報を取得
   */
  static getFileInfo = (file: File): FileInfo => {
    const extension = getFileExtension(file.name)
    const config = FILE_TYPE_CONFIGS.find(config => config.ext === extension || config.mediaType === file.type)

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      extension,
      mediaType: config?.mediaType || null,
    }
  }

  /**
   * ファイル検証（強化版）
   */
  static validateFile = (file: File): FileValidationResult => {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    if (!isValidFile(file)) {
      result.isValid = false
      result.errors.push('無効なファイルオブジェクトです')
      return result
    }

    // ファイル名チェック
    if (!file.name || file.name.trim().length === 0) {
      result.isValid = false
      result.errors.push('ファイル名が空です')
    }

    // ファイルサイズチェック（0バイト）
    if (file.size === 0) {
      result.isValid = false
      result.errors.push('ファイルサイズが0バイトです')
    }

    // 拡張子チェック
    const extension = getFileExtension(file.name)
    const config = FILE_TYPE_CONFIGS.find(config => config.ext === extension || config.mediaType === file.type)

    if (!config) {
      result.isValid = false
      result.errors.push(`サポートされていないファイル形式です: ${extension || file.type}`)
    } else {
      // サイズ制限チェック
      if (config.maxSize && file.size > config.maxSize) {
        result.isValid = false
        result.errors.push(`ファイルサイズが制限を超えています: ${formatFileSize(file.size)} > ${formatFileSize(config.maxSize)}`)
      }

      // MIMEタイプの一致チェック
      if (file.type && file.type !== config.mediaType) {
        result.warnings.push(`ファイルの拡張子とMIMEタイプが一致しません: ${extension} vs ${file.type}`)
      }
    }

    // ファイル名の安全性チェック
    if (unsafeChars.test(file.name)) {
      result.warnings.push('ファイル名に安全でない文字が含まれています')
    }

    return result
  }

  /**
   * S3へのファイル送信（強化版）
   */
  static sendFileToS3 = async (props: SendFileToS3Props): Promise<UploadResult> => {
    const {file, formDataObj, onProgress, validateFile = true} = props

    // 入力検証
    if (!isValidFile(file)) {
      return {
        success: false,
        message: '無効なファイルです',
        error: 'Invalid file object',
      }
    }

    if (!formDataObj || typeof formDataObj !== 'object') {
      return {
        success: false,
        message: '無効なフォームデータです',
        error: 'Invalid form data object',
      }
    }

    // ファイル検証（オプション）
    if (validateFile) {
      const validation = FileHandler.validateFile(file)
      if (!validation.isValid) {
        return {
          success: false,
          message: 'ファイル検証に失敗しました',
          error: validation.errors.join(', '),
        }
      }
    }

    const startTime = Date.now()

    try {
      // FormDataの構築
      const formData = new FormData()
      formData.append('file', file)

      Object.entries(formDataObj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value))
        }
      })

      // アップロード設定
      const config: any = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5分タイムアウト
      }

      // プログレス監視
      if (onProgress) {
        config.onUploadProgress = (progressEvent: any) => {
          const {loaded, total} = progressEvent
          if (total > 0) {
            const percentage = Math.round((loaded * 100) / total)
            onProgress({loaded, total, percentage})
          }
        }
      }

      // アップロード実行
      const response = await Axios.post('/api/S3', formData, config)
      const result: requestResultType = response.data

      const uploadTime = Date.now() - startTime
      const fileInfo = FileHandler.getFileInfo(file)

      return {
        ...result,
        fileInfo,
        uploadTime,
      }
    } catch (error) {
      console.error('Error uploading file to S3:', error)

      let errorMessage = 'ファイルアップロードに失敗しました'

      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'アップロードがタイムアウトしました'
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'ネットワークエラーが発生しました'
        }
      }

      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
        uploadTime: Date.now() - startTime,
      }
    }
  }

  /**
   * サポートされているファイル形式かチェック
   */
  static isSupportedFileType = (file: File): boolean => {
    const extension = getFileExtension(file.name)
    return FILE_TYPE_CONFIGS.some(config => config.ext === extension || config.mediaType === file.type)
  }

  /**
   * ファイル形式の設定を取得
   */
  static getFileTypeConfig = (file: File): FileTypeConfig | null => {
    const extension = getFileExtension(file.name)
    return FILE_TYPE_CONFIGS.find(config => config.ext === extension || config.mediaType === file.type) || null
  }

  /**
   * 複数ファイルの一括検証
   */
  static validateFiles = (files: File[]): FileValidationResult => {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    if (!Array.isArray(files) || files.length === 0) {
      result.isValid = false
      result.errors.push('ファイルが選択されていません')
      return result
    }

    files.forEach((file, index) => {
      const validation = FileHandler.validateFile(file)

      if (!validation.isValid) {
        result.isValid = false
        validation.errors.forEach(error => {
          result.errors.push(`ファイル${index + 1}: ${error}`)
        })
      }

      validation.warnings.forEach(warning => {
        result.warnings.push(`ファイル${index + 1}: ${warning}`)
      })
    })

    return result
  }

  /**
   * ファイルサイズの合計を計算
   */
  static getTotalFileSize = (files: File[]): number => {
    if (!Array.isArray(files)) return 0

    return files.reduce((total, file) => {
      return total + (isValidFile(file) ? file.size : 0)
    }, 0)
  }

  /**
   * ファイル形式別の統計を取得
   */
  static getFileTypeStats = (files: File[]) => {
    if (!Array.isArray(files)) return {}

    const stats: Record<string, {count: number; totalSize: number}> = {}

    files.forEach(file => {
      if (!isValidFile(file)) return

      const config = FileHandler.getFileTypeConfig(file)
      const key = config?.description || 'その他'

      if (!stats[key]) {
        stats[key] = {count: 0, totalSize: 0}
      }

      stats[key].count++
      stats[key].totalSize += file.size
    })

    return stats
  }
}

// 型エクスポート

// 後方互換性のための型エイリアス
export type fileType = FileTypeConfig
