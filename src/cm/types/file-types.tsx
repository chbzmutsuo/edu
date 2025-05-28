export type MediaType =
  // Application types
  | 'application/javascript'
  | 'application/json'
  | 'application/octet-stream'
  | 'application/pdf'
  | 'application/xml'
  | 'application/zip'
  | 'application/gzip'
  // Text types
  | 'text/css'
  | 'text/csv'
  | 'text/html'
  | 'text/plain'
  | 'text/xml'
  // Image types
  | 'image/bmp'
  | 'image/gif'
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png'
  | 'image/svg+xml'
  | 'image/tiff'
  | 'image/webp'
  // Audio types
  | 'audio/midi'
  | 'audio/mpeg'
  | 'audio/ogg'
  | 'audio/x-wav'
  | 'audio/webm'
  // Video types
  | 'video/quicktime'
  | 'video/mp4'
  | 'video/mpeg'
  | 'video/ogg'
  | 'video/webm'
  | 'video/x-msvideo'

export type extType =
  | '.mov'
  | '.js'
  | '.json'
  | '.bin'
  | '.pdf'
  | '.xml'
  | '.zip'
  | '.gz'
  | '.css'
  | '.csv'
  | '.html'
  | '.txt'
  | '.bmp'
  | '.gif'
  | '.jpg'
  | '.jpeg'
  | '.png'
  | '.svg'
  | '.tif'
  | '.tiff'
  | '.webp'
  | '.midi'
  | '.mp3'
  | '.ogg'
  | '.wav'
  | '.weba'
  | '.mp4'
  | '.mpeg'
  | '.ogv'
  | '.webm'
  | '.avi'

export type acceptType = {
  [key in MediaType]?: extType[]
}

/**fileStateArrの元となるデータ */
export type FileData = {
  file: File //通常のFileオブジェクト
  fileName: string
  fileSize: number
  fileContent: any | null
}

export type fileInfo = {
  ext: string
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}
