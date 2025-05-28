import ffmpeg from 'fluent-ffmpeg'
import {S3} from 'aws-sdk'
import multer from 'multer'

import {v4 as uuidv4} from 'uuid'

import {getFileInfo} from 'src/non-common/serverSideFunction'
import {requestResultType} from '@cm/types/types'

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '8mb',
  },
}

const upload = multer({storage: multer.memoryStorage()})
export type S3_API_FormData = {
  backetKey: string
  deleteImageUrl?: string
}

export async function handler(req, res) {
  upload.single('file')(req, res, async err => {
    let updatedImage
    let result: requestResultType = {
      success: false,
      message: '画像を更新できませんでした',
      result: {},
    }

    try {
      // multerを使用してreq.bodyを解析します
      const body: S3_API_FormData = req.body

      const {backetKey, deleteImageUrl} = body

      if (!backetKey) {
        return res.status(500).json({success: false, message: 'backetKey is required'})
      }
      if (err) {
        console.error(err)
        return res.status(500).json({error: err.message})
      }

      let fileInfo

      //画像作成
      if (req.file) {
        const fileInfo = await getFileInfo(req.file)
        const {ext, mimetype, buffer} = fileInfo

        const fileBuffer = buffer

        // HEVC動画の場合の変換

        // const outputBuffer = await convertMOVtoMP4(buffer)
        // bufferを使用してS3にアップロード、または他の処理を行う

        const unresizableImage = ['heic', 'heif'] //heic, heif, webp, tiff, bmp, gif, png, jpeg, jpg
        // if (mimetype.startsWith('image') && !unresizableImage.includes(ext)) {
        //   fileBuffer = await sharp(buffer)
        //     // .resize(800, 800, {fit: 'contain'})
        //     .toFormat(mimetype.split('/')[1])
        //     .toBuffer()
        // }

        updatedImage = await updateImageToS3({
          s3,
          backetKey,
          fileBuffer,
          mimetype,
          ext,
        })
      }

      //画像削除
      if (deleteImageUrl) {
        await deleteImageFromS3({s3, backetKey, deleteImageUrl})
      }

      result = {
        success: true,
        message: '画像を更新しました',
        result: {
          url: updatedImage?.Location,
          // fileInfo,
        },
      }
    } catch (error) {
      result.error = error
      console.error(error)
      return res.json(result)
    }

    return res.json(result)
  })

  function convertMOVtoMP4(buffer) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(buffer)
        .toFormat('mp4')
        .on('end', () => {
          console.info('Conversion finished.')
        })
        .on('error', err => {
          reject(err)
        })
        .pipe(res, {end: true}) // 結果をBufferとして取得する
    })
  }
}

export default handler

async function deleteImageFromS3({s3, backetKey, deleteImageUrl}) {
  const key = deleteImageUrl.split('/').pop() // Extract the key from the image URL

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${backetKey}/${key}`,
  }

  try {
    console.info(params)
    const deletedImageres = await s3.deleteObject(params).promise()
    console.info('画像削除　成功', {deletedImageres})
    return deletedImageres
  } catch (error) {
    console.error('画像削除 エラー', error)
  }
}

async function updateImageToS3({s3, backetKey, fileBuffer, mimetype, ext}) {
  const key = `${backetKey}/${uuidv4()}.${ext}`
  const params = {
    Bucket: `${process.env.S3_BUCKET_NAME}`,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  }

  const {Bucket, Key, ContentType} = params
  console.info({Bucket, Key, ContentType})
  try {
    console.info('画像追加　成功')
    return await s3.upload(params).promise()
  } catch (error) {
    console.error('画像追加　エラー', error)
  }
}
