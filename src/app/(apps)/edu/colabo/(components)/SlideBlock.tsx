'use client'

import {MarkDownDisplay} from '@cm/components/utils/texts/MarkdownDisplay'

export const SlideBlock = ({block, isPreview = false}) => {
  const {
    blockType,
    content,
    imageUrl,
    linkUrl,
    alignment = 'left',
    verticalAlign = 'top',
    textColor,
    backgroundColor,
    fontWeight,
    textDecoration,
    isCorrectAnswer
  } = block

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-left'
    }
  }

  const getVerticalAlignClass = () => {
    switch (verticalAlign) {
      case 'middle': return 'flex items-center'
      case 'bottom': return 'flex items-end'
      default: return 'flex items-start'
    }
  }

  const getTextStyle = () => ({
    color: textColor || 'inherit',
    backgroundColor: backgroundColor || 'transparent',
    fontWeight: fontWeight || 'normal',
    textDecoration: textDecoration || 'none',
  })

  const containerClass = `${getAlignmentClass()} ${getVerticalAlignClass()} min-h-16 p-2`

  if (blockType === 'text') {
    return (
      <div className={containerClass} style={getTextStyle()}>
        {isPreview ? (
          <MarkDownDisplay>{content}</MarkDownDisplay>
        ) : (
          <div className="w-full">
            <div className="text-sm text-gray-600 mb-1">テキストブロック</div>
            <div className="border rounded p-2 min-h-16 bg-gray-50">
              {content ? (
                <MarkDownDisplay>{content}</MarkDownDisplay>
              ) : (
                <span className="text-gray-400">テキストを入力してください</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (blockType === 'image') {
    return (
      <div className={containerClass}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={content || 'スライド画像'} 
            className="max-w-full h-auto rounded"
            style={getTextStyle()}
          />
        ) : (
          !isPreview && (
            <div className="w-full">
              <div className="text-sm text-gray-600 mb-1">画像ブロック</div>
              <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center text-gray-400">
                画像URLを設定してください
              </div>
            </div>
          )
        )}
      </div>
    )
  }

  if (blockType === 'link') {
    return (
      <div className={containerClass}>
        {linkUrl ? (
          <a 
            href={linkUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
            style={getTextStyle()}
          >
            {content || linkUrl}
          </a>
        ) : (
          !isPreview && (
            <div className="w-full">
              <div className="text-sm text-gray-600 mb-1">リンクブロック</div>
              <div className="border rounded p-2 bg-gray-50 text-gray-400">
                リンクURLを設定してください
              </div>
            </div>
          )
        )}
      </div>
    )
  }

  if (blockType === 'quiz_question') {
    return (
      <div className={containerClass}>
        <div className="w-full">
          {!isPreview && (
            <div className="text-sm text-gray-600 mb-1">クイズ問題</div>
          )}
          <div 
            className={isPreview ? 'text-xl font-bold' : 'border rounded p-3 bg-blue-50'}
            style={getTextStyle()}
          >
            {content ? (
              <MarkDownDisplay>{content}</MarkDownDisplay>
            ) : (
              !isPreview && (
                <span className="text-gray-400">問題文を入力してください</span>
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  if (blockType === 'choice_option') {
    return (
      <div className={containerClass}>
        <div className="w-full">
          {!isPreview && (
            <div className="text-sm text-gray-600 mb-1">
              選択肢 {isCorrectAnswer && <span className="text-green-600">(正解)</span>}
            </div>
          )}
          <div 
            className={`
              ${isPreview ? 'border-2 rounded-lg p-3 cursor-pointer hover:bg-gray-50' : 'border rounded p-2 bg-gray-50'}
              ${isCorrectAnswer && isPreview ? 'border-green-400' : 'border-gray-300'}
            `}
            style={getTextStyle()}
          >
            {content ? (
              <MarkDownDisplay>{content}</MarkDownDisplay>
            ) : (
              !isPreview && (
                <span className="text-gray-400">選択肢を入力してください</span>
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <div className="text-gray-400">未知のブロックタイプ: {blockType}</div>
    </div>
  )
}