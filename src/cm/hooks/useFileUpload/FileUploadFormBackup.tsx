'use client'
import ContentPlayer from 'src/cm/components/utils/ContentPlayer'

import React, {useState} from 'react'
import {toast} from 'react-toastify'
import {anyObject} from '@cm/types/types'
import {cl} from 'src/cm/lib/methods/common'

type FileUploadFormProps = {
  onSubmit: (props: {fileArrState: FileData[]}) => void
  readAs: 'readAsText' | 'readAsDataURL' | 'readAsArrayBuffer' | 'readAsBinaryString' | undefined
  charset?: string
  maxFiles?: number
  fileContentAs?: 'csv'
} & anyObject

export type FileData = {
  file: anyObject
  fileName: string
  fileSize: number
  fileContent: any | null | undefined
  // fileReadResult: any | null
}

const FileUploadForm = (props: FileUploadFormProps) => {
  const {charset = 'UTF-8', onSubmit, maxFiles = 2, readAs = 'readAsDataURL', fileContentAs = 'csv'} = props
  const [fileArrState, setfileArrState] = useState<FileData[]>([])

  const handleFileChange = async event => {
    const files = event?.target?.files

    const promises = Array.from(files).map(async (file: File, i) => {
      return new Promise<FileData>((resolve, reject) => {
        const reader = new FileReader()

        readAs ? reader[readAs](file) : '' //読み取り方の指定

        reader.onload = () => {
          let fileContent: any = reader.result
          if (fileContentAs === 'csv') {
            const table: any[] = []
            const content = fileContent as string
            content.split('\n').forEach(str => {
              // 注意：ここでは forEach を使用
              const hasValue = str.replace(/,|\r/g, '')
              if (hasValue) {
                const row = str.split(',')
                table.push(row)
              }
              fileContent = table
            })

            const fileStateForSingleItem: FileData = {
              file,
              fileName: file.name,
              fileSize: file.size,
              fileContent,
            }

            resolve(fileStateForSingleItem)
          }
        }

        reader.onerror = () => {
          toast.error('読み込みに失敗しました')
          reject()
        }
      })
    })

    Promise.all(promises)
      .then(fileArr => {
        setfileArrState(fileArr)
      })
      .catch(err => {
        // エラーハンドリング
      })
  }

  const errors: any[] = []
  if (maxFiles && fileArrState.length > maxFiles) {
    errors.push({msg: `ファイルは最大${maxFiles}個まで選択できます`})
  }

  return (
    <div className={`t-paper w-fit max-w-sm`}>
      <section className={`row-stack  p-1`}>
        <input className={` border-sub-main w-[280px] border-2  p-1`} type="file" onChange={handleFileChange} multiple />

        <button
          className={`t-btn rounded-xs text-lg`}
          onClick={e => {
            if (fileArrState.length === 0) {
              alert('ファイルを選択してください')
              return
            }

            onSubmit({fileArrState}) // ここで親コンポーネントにデータを渡す
          }}
          disabled={errors.length > 0}
        >
          確定
        </button>
      </section>
      <section>
        <ul className={'mx-auto flex w-[330px] flex-wrap gap-2 gap-y-4'}>
          {fileArrState.map((obj, idx) => {
            const overFile = idx >= maxFiles

            return (
              <li key={idx} className={cl(`t-paper alignJustCenter relative  w-[160px] overflow-hidden`)}>
                {overFile && (
                  <div className={`absolute-center alignJustCenter h-full w-full  bg-black font-bold text-white opacity-80`}>
                    Not Available
                  </div>
                )}
                <ContentPlayer src={obj.fileContent} />
              </li>
            )
          })}
        </ul>
        <ul>
          {errors.map((error, idx) => {
            return (
              <li key={idx} className={`text-error-main pl-2`}>
                *{error.msg}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

export default FileUploadForm
