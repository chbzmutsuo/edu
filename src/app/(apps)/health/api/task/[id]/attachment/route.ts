import {NextRequest, NextResponse} from 'next/server'
import prisma from '@lib/prisma'
import {writeFile, mkdir} from 'fs/promises'
import {join} from 'path'
import {randomBytes} from 'crypto'
import {existsSync} from 'fs'

export async function POST(request: NextRequest) {
  const formData = await request.formData()

  const taskId = Number(formData.get('taskId'))
  try {
    if (isNaN(taskId)) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なタスクIDです',
        },
        {status: 400}
      )
    }

    // タスクの存在確認
    const task = await prisma.task.findUnique({
      where: {id: taskId},
    })

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'タスクが見つかりません',
        },
        {status: 404}
      )
    }

    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'ファイルが選択されていません',
        },
        {status: 400}
      )
    }

    // ファイルサイズ制限（10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'ファイルサイズが大きすぎます（最大10MB）',
        },
        {status: 400}
      )
    }

    // ファイル形式チェック（画像のみ）
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'サポートされていないファイル形式です（JPEG、PNG、GIF、WebPのみ）',
        },
        {status: 400}
      )
    }

    // ユニークなファイル名を生成
    const timestamp = Date.now()
    const randomString = randomBytes(3).toString('hex')
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}_${randomString}.${extension}`

    // アップロードディレクトリの確保

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'task')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, {recursive: true})
    }

    // ファイルを保存
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    // DBにレコード追加
    const attachment = await prisma.taskAttachment.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/task/${filename}`,
        taskId,
      },
    })

    return NextResponse.json({
      success: true,
      data: attachment,
    })
  } catch (error) {
    console.error('ファイルアップロードエラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'ファイルのアップロードに失敗しました',
      },
      {status: 500}
    )
  }
}
