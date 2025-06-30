'use client'
import {FileHandler} from 'src/cm/class/FileHandler'
// import {extname} from 'path'
import BasicModal from 'src/cm/components/utils/modal/BasicModal'

import dynamic from 'next/dynamic'

import {anyObject} from '@cm/types/utility-types'

import useWindowSize from 'src/cm/hooks/useWindowSize'

import {Absolute, Center, R_Stack} from 'src/cm/components/styles/common-components/common-components'
import {cl} from 'src/cm/lib/methods/common'
import {pathToNoImage} from '@components/DataLogic/TFs/MyForm/components/HookFormControl/Control/MyFileControl/MyFileControl'
import {ArrowDownTrayIcon} from '@heroicons/react/20/solid'
import {T_LINK} from '@components/styles/common-components/links'
import {useMemo, memo} from 'react'
import {Download, FileDown, ZoomIn} from 'lucide-react'

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => <div>Loading player...</div>,
})

export type filecolTypeString = 'image' | 'video' | 'audio' | 'text' | 'application' | undefined
type ContentPlayerProps = {
  src: string
  fileType?: filecolTypeString
  mediaType?: filecolTypeString
  styles?: {thumbnail?: anyObject; main?: anyObject}
  options?: {download?: boolean}
  showOnlyMain?: boolean
} & anyObject

const ImageRenderer = memo(({src, style}: {src: string; style: anyObject}) => <img src={src} alt="" style={style} />)

const VideoRenderer = memo(({src, style}: {src: string; style: anyObject}) => (
  <ReactPlayer url={src} controls={true} style={style} />
))

export default function ContentPlayer(props: ContentPlayerProps) {
  const WD = useWindowSize()
  const extname = src => {
    const reg = new RegExp(/\.\w+$/)
    return String(src)?.match(reg)?.[0] ?? ''
  }

  const {mediaType, styles = {}, options, ...rest} = props
  let {src} = props
  src = src ? src : pathToNoImage

  const fileTypeAndStyles = useMemo(() => {
    const ext = extname(src)
    const mediaTypeFromExt = FileHandler.mediaTypes?.find(obj => ext === obj.ext)?.mediaType
    let fileType = props.fileType ?? mediaType ?? mediaTypeFromExt?.split('/')[0] ?? 'application'

    if (src.includes('google.com')) {
      fileType = 'image'
    }

    const thumbnailStyle = {width: '100%', height: '100%', ...styles.thumbnail}
    const mainStyle = {
      width: WD.width * 0.85 - 50,
      minHeight: WD.height * 0.9 - 50,
      ...styles.main,
    }

    return {fileType, thumbnailStyle, mainStyle}
  }, [src, props.fileType, mediaType, styles, WD.width, WD.height])

  const {thumbnail, main} = (function () {
    let thumbnail, main

    const ext = extname(src)
    const mediaTypeFromExt = FileHandler.mediaTypes?.find(obj => ext === obj.ext)?.mediaType
    let fileType = props.fileType ?? mediaType ?? mediaTypeFromExt?.split('/')[0] ?? 'application'
    if (src.includes(`google.com`)) {
      fileType = 'image'
    }

    switch (fileType) {
      case 'application': {
        thumbnail = <object data={src} width="100%" height={'100%'} />
        main = <object data={src} style={fileTypeAndStyles.mainStyle} />

        break
      }

      case 'video': {
        thumbnail = <video src={src}></video>
        main = <VideoRenderer src={src} style={fileTypeAndStyles.mainStyle} />
        break
      }
      default: {
        thumbnail = (
          <img
            src={src}
            alt=""
            // style={{...fileTypeAndStyles.thumbnailStyle,
            // }}
          />
        )

        main = <ImageRenderer src={src} style={fileTypeAndStyles.mainStyle} />
      }
    }
    return {thumbnail, main}
  })()

  const btnClass = ` absolute w-6  hover:opacity-100 z-50`
  if (!src) {
    return <div>画像を読み込めません</div>
  } else if (props.showOnlyMain) {
    return <Center style={{...styles.main, overflow: 'hidden'}}>{main}</Center>
  } else {
    return (
      <main
        {...rest}
        style={fileTypeAndStyles.thumbnailStyle}
        className={cl('relative overflow-hidden bg-white', rest.className)}
      >
        <div className={`z-10 absolute !right-2 !bottom-2 `}>
          <R_Stack className={`gap-3`}>
            <DownloadBtn src={src} options={options} />
            <ZoomInBtn fileTypeAndStyles={fileTypeAndStyles} styles={styles} main={main} />
          </R_Stack>
        </div>

        <div>
          <Center style={{...styles.thumbnail}}>
            <div>{thumbnail}</div>
          </Center>
        </div>
      </main>
    )
  }
}

const ZoomInBtn = ({
  fileTypeAndStyles,
  styles,
  main,
}: {
  fileTypeAndStyles: anyObject
  styles: anyObject
  main: React.ReactNode
}) => {
  return (
    <BasicModal
      {...{
        style: {
          maxHeight: '90vh',
          maxWidth: '90vw',
        },
        btnComponent: (
          <Center
            style={{
              zIndex: 200,
              ...fileTypeAndStyles.thumbnailStyle,
              margin: `auto`,
              cursor: 'zoom-in',
            }}
          >
            <ZoomIn className="w-7 h-7 bg-gray-500 text-white rounded-full p-1 shadow-lg" />
          </Center>
        ),
        alertOnClose: false,
      }}
    >
      <Center style={{...styles.main, overflow: 'hidden'}}>{main}</Center>
    </BasicModal>
  )
}

const DownloadBtn = ({src, options}: {src: string; options?: {download?: boolean}}) => {
  if (options?.download && !String(src).includes('data:')) {
    return (
      <T_LINK href={src} target="_blank" simple>
        <ArrowDownTrayIcon className={`${btnClass}    h-4  `} />
      </T_LINK>
    )
  }
  return null
}
const btnClass = 'w-7 h-7 bg-gray-500 text-white rounded-full p-1 shadow-lg'
