// Next.js + Tailwind + Zustand で構成
// Step 1: スライド作成ページの初期セットアップ

'use client'

import {useState, useEffect} from 'react'
import {Rnd} from 'react-rnd'
import {io} from 'socket.io-client'

let socket: any = null

export default function SlideCreatePage() {
  const [slides, setSlides] = useState<any[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const addSlide = () => {
    const newSlide = {
      id: crypto.randomUUID(),
      elements: [],
    }
    setSlides([...slides, newSlide])
    setCurrentSlideIndex(slides.length)
  }

  const addTextElement = () => {
    const newElement = {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'テキスト',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      style: {color: '#222', fontSize: 20, background: '#fff', border: '1px solid #ccc'},
    }
    const newSlides = [...slides]
    newSlides[currentSlideIndex].elements.push(newElement)
    setSlides(newSlides)
  }

  const updateElement = (elementId, updates) => {
    const newSlides = [...slides]
    const elements = newSlides[currentSlideIndex].elements
    const idx = elements.findIndex(e => e.id === elementId)
    if (idx !== -1) {
      elements[idx] = {...elements[idx], ...updates}
      setSlides(newSlides)
    }
  }

  // 画像ファイルアップロード
  const handleImageUpload = e => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const newElement = {
      id: crypto.randomUUID(),
      type: 'image',
      src: url,
      x: 120,
      y: 120,
      width: 240,
      height: 180,
      style: {background: '#fff', border: '1px solid #ccc'},
    }
    const newSlides = [...slides]
    newSlides[currentSlideIndex].elements.push(newElement)
    setSlides(newSlides)
  }

  // 動画ファイルアップロード
  const handleVideoUpload = e => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const newElement = {
      id: crypto.randomUUID(),
      type: 'video',
      src: url,
      x: 140,
      y: 140,
      width: 320,
      height: 200,
      style: {background: '#000', border: '1px solid #ccc'},
    }
    const newSlides = [...slides]
    newSlides[currentSlideIndex].elements.push(newElement)
    setSlides(newSlides)
  }

  // 選択中要素取得
  const selectedElement = slides[currentSlideIndex]?.elements.find(e => e.id === selectedElementId) || null

  // セッション開始
  const startSession = () => {
    const id = Math.random().toString(36).slice(2, 10)
    setSessionId(id)
    if (!socket) {
      socket = io(`/api/slide-socket`)
    }
    socket.emit('join-session', id)
    // 初期状態を送信
    socket.emit('slide-update', {sessionId: id, slideIndex: currentSlideIndex, slides})
  }

  // スライド切り替え時に同期
  useEffect(() => {
    if (sessionId && socket) {
      socket.emit('slide-update', {sessionId, slideIndex: currentSlideIndex, slides})
    }
  }, [currentSlideIndex, slides, sessionId])

  // セッション開始後のページ送り
  const goToSlide = (idx: number) => {
    if (slides.length === 0) return
    const newIdx = Math.max(0, Math.min(idx, slides.length - 1))
    setCurrentSlideIndex(newIdx)
    if (sessionId && socket) {
      socket.emit('slide-update', {sessionId, slideIndex: newIdx, slides})
    }
  }

  return (
    <main className="flex ">
      <div className="w-1/5 bg-gray-100 p-2 overflow-y-auto">
        <SlideList slides={slides} currentIndex={currentSlideIndex} setCurrentIndex={setCurrentSlideIndex} />
        <button onClick={addSlide} className="mt-4 w-full p-2 bg-blue-500 text-white rounded">
          ＋ スライド追加
        </button>
        <button
          onClick={startSession}
          className="mt-2 w-full p-2 bg-indigo-600 text-white rounded"
          disabled={!!sessionId || slides.length === 0}
        >
          セッション開始
        </button>
        {sessionId && (
          <div className="mt-4 p-2 bg-white border rounded text-xs">
            <div className="mb-1 font-bold text-indigo-700">セッションID</div>
            <div className="mb-1 break-all">{sessionId}</div>
            <button
              className="text-blue-500 underline"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/CoLab/slide/session/${sessionId}`)
                alert('URLをコピーしました')
              }}
            >
              参加用URLをコピー
            </button>
          </div>
        )}
        {sessionId && (
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => goToSlide(currentSlideIndex - 1)}
              disabled={currentSlideIndex === 0}
              className="w-full px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              前へ
            </button>
            <div className="text-center text-lg font-bold">
              スライド {currentSlideIndex + 1} / {slides.length}
            </div>
            <button
              onClick={() => goToSlide(currentSlideIndex + 1)}
              disabled={currentSlideIndex === slides.length - 1}
              className="w-full px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              次へ
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 p-4 relative bg-gray-50">
        {slides.length > 0 ? (
          <SlideCanvas
            elements={slides[currentSlideIndex].elements}
            updateElement={updateElement}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
          />
        ) : (
          <div className="text-center text-gray-400">スライドを追加してください</div>
        )}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button onClick={addTextElement} className="px-4 py-2 bg-green-600 text-white rounded shadow">
            テキスト
          </button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded shadow cursor-pointer">
            画像
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <label className="px-4 py-2 bg-red-600 text-white rounded shadow cursor-pointer">
            動画
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
          </label>
        </div>
      </div>
      <div className="w-1/5 bg-gray-50 p-4 border-l">
        <ControlPanel slides={slides} />
        <DesignPanelWrapper
          selectedElement={selectedElement}
          updateElement={updates =>
            selectedElement && updateElement(selectedElement.id, {style: {...selectedElement.style, ...updates}})
          }
          slidesState={[slides, setSlides]}
          currentSlideIndex={currentSlideIndex}
          setSelectedElementId={setSelectedElementId}
        />
      </div>
    </main>
  )
}

function SlideList({slides, currentIndex, setCurrentIndex}) {
  return (
    <div>
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => setCurrentIndex(index)}
          className={`w-full text-left p-2 mb-1 rounded ${
            index === currentIndex ? 'bg-blue-100' : 'bg-white'
          } border hover:bg-blue-50`}
        >
          {index + 1}. {slide.type === 'text' ? 'テキスト' : 'アンケート'}
        </button>
      ))}
    </div>
  )
}

function SlideEditor({slide, updateContent}) {
  const handleChange = e => {
    updateContent({...slide.content, text: e.target.value})
  }

  if (slide.type === 'text') {
    return (
      <div>
        <h2 className="text-lg font-bold mb-2">テキストスライド編集</h2>
        <textarea
          value={slide.content.text || ''}
          onChange={handleChange}
          className="w-full h-64 border rounded p-2"
          placeholder="スライドの本文を入力..."
        />
      </div>
    )
  }

  if (slide.type === 'poll') {
    const handleOptionChange = (index, value) => {
      const options = [...(slide.content.options || [])]
      options[index] = value
      updateContent({...slide.content, options})
    }

    const addOption = () => {
      updateContent({...slide.content, options: [...(slide.content.options || []), '']})
    }

    return (
      <div>
        <h2 className="text-lg font-bold mb-2">アンケートスライド編集</h2>
        <input
          type="text"
          className="w-full mb-2 p-2 border rounded"
          placeholder="質問を入力..."
          value={slide.content.question || ''}
          onChange={e => updateContent({...slide.content, question: e.target.value})}
        />
        {(slide.content.options || []).map((opt, i) => (
          <input
            key={i}
            type="text"
            className="w-full mb-1 p-2 border rounded"
            placeholder={`選択肢 ${i + 1}`}
            value={opt}
            onChange={e => handleOptionChange(i, e.target.value)}
          />
        ))}
        <button onClick={addOption} className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">
          選択肢を追加
        </button>
      </div>
    )
  }

  return <div>未対応のスライドタイプです</div>
}

function ControlPanel({slides}) {
  const handleSave = () => {
    console.log('保存データ:', slides)
    alert('仮保存されました（実装予定）')
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">操作パネル</h2>
      <button onClick={handleSave} className="w-full p-2 bg-indigo-600 text-white rounded mb-2">
        保存
      </button>
      <button className="w-full p-2 bg-gray-400 text-white rounded mb-2">並べ替え（未実装）</button>
      <button className="w-full p-2 bg-green-600 text-white rounded">公開（未実装）</button>
    </div>
  )
}

function SlideCanvas({elements, updateElement, selectedElementId, setSelectedElementId}) {
  return (
    <div className="w-full h-[80vh] bg-white border relative overflow-hidden">
      {elements.map(el => (
        <Rnd
          key={el.id}
          size={{width: el.width, height: el.height}}
          position={{x: el.x, y: el.y}}
          onDragStop={(e, d) => updateElement(el.id, {x: d.x, y: d.y})}
          onResizeStop={(e, direction, ref, delta, position) =>
            updateElement(el.id, {
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
              x: position.x,
              y: position.y,
            })
          }
          bounds="parent"
        >
          {el.type === 'text' && (
            <textarea
              value={el.content}
              onChange={e => updateElement(el.id, {content: e.target.value})}
              onClick={e => {
                e.stopPropagation()
                setSelectedElementId(el.id)
              }}
              style={{
                width: '100%',
                height: '100%',
                ...el.style,
                textAlign: el.style?.textAlign || 'left',
                resize: 'none',
                outline: selectedElementId === el.id ? '2px solid #2563eb' : 'none',
                padding: 8,
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
              className="rounded shadow"
            />
          )}
          {el.type === 'image' && (
            <img
              src={el.src}
              alt="画像"
              draggable={false}
              onClick={e => {
                e.stopPropagation()
                setSelectedElementId(el.id)
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                ...el.style,
                border: 'none',
                outline: selectedElementId === el.id ? '2px solid #2563eb' : 'none',
                cursor: 'pointer',
              }}
            />
          )}
          {el.type === 'video' && (
            <video
              src={el.src}
              controls
              draggable={false}
              onClick={e => {
                e.stopPropagation()
                setSelectedElementId(el.id)
              }}
              style={{
                width: '100%',
                height: '100%',
                background: '#000',
                border: 'none',
                ...el.style,
                outline: selectedElementId === el.id ? '2px solid #2563eb' : 'none',
                cursor: 'pointer',
              }}
            />
          )}
        </Rnd>
      ))}
    </div>
  )
}

// デザイン編集パネル
function DesignPanel({selectedElement, updateElement}) {
  // 下記のエラーをなくしたい

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const {slides, setSlides, currentSlideIndex, setSelectedElementId} = DesignPanel.context || {}
  if (!selectedElement) return null
  const style = selectedElement.style || {}
  // 削除処理
  const handleDelete = () => {
    if (!slides || !setSlides) return
    const newSlides = [...slides]
    newSlides[currentSlideIndex].elements = newSlides[currentSlideIndex].elements.filter(e => e.id !== selectedElement.id)
    setSlides(newSlides)
    setSelectedElementId(null)
  }
  // 複製処理
  const handleCopy = () => {
    if (!slides || !setSlides) return
    const newSlides = [...slides]
    const copy = {...selectedElement, id: crypto.randomUUID(), x: (selectedElement.x || 0) + 30, y: (selectedElement.y || 0) + 30}
    newSlides[currentSlideIndex].elements.push(copy)
    setSlides(newSlides)
    setSelectedElementId(copy.id)
  }
  return (
    <div className="mt-8 p-4 bg-white rounded shadow">
      <h3 className="font-bold mb-2 text-gray-700">デザイン編集</h3>
      <div className="mb-2">
        <label className="block text-xs text-gray-500">文字色</label>
        <input type="color" value={style.color || '#222'} onChange={e => updateElement({color: e.target.value})} />
      </div>
      <div className="mb-2">
        <label className="block text-xs text-gray-500">フォントサイズ</label>
        <input
          type="number"
          min={8}
          max={100}
          value={style.fontSize || 20}
          onChange={e => updateElement({fontSize: parseInt(e.target.value)})}
          className="w-16 border rounded p-1"
        />{' '}
        px
      </div>
      ｍｍ
      <div className="mb-2">
        <label className="block text-xs text-gray-500">背景色</label>
        <input type="color" value={style.background || '#fff'} onChange={e => updateElement({background: e.target.value})} />
      </div>
      <div className="mb-2">
        <label className="block text-xs text-gray-500">枠線色</label>
        <input
          type="color"
          value={getBorderColor(style.border)}
          onChange={e => updateElement({border: `1px solid ${e.target.value}`})}
        />
      </div>
      {selectedElement.type === 'text' && (
        <div className="mb-2">
          <label className="block text-xs text-gray-500 mb-1">文字揃え</label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => updateElement({textAlign: 'left'})}
              className={`px-2 py-1 rounded ${style.textAlign === 'left' || !style.textAlign ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              左
            </button>
            <button
              type="button"
              onClick={() => updateElement({textAlign: 'center'})}
              className={`px-2 py-1 rounded ${style.textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              中央
            </button>
            <button
              type="button"
              onClick={() => updateElement({textAlign: 'right'})}
              className={`px-2 py-1 rounded ${style.textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              右
            </button>
          </div>
        </div>
      )}
      <div className="flex gap-2 mt-4">
        <button onClick={handleCopy} className="px-3 py-1 bg-blue-500 text-white rounded">
          コピー
        </button>
        <button onClick={handleDelete} className="px-3 py-1 bg-red-500 text-white rounded">
          削除
        </button>
      </div>
    </div>
  )
}

// 枠線色取得用ユーティリティ
function getBorderColor(border) {
  if (!border) return '#ccc'
  const match = border.match(/\s(#[0-9a-fA-F]{3,6}|rgb\(.+\))/)
  return match ? match[1] : '#ccc'
}

// DesignPanelにcontextを渡すためのラッパー
function DesignPanelWrapper(props) {
  const [slides, setSlides] = props.slidesState
  const currentSlideIndex = props.currentSlideIndex
  const setSelectedElementId = props.setSelectedElementId
  // contextをpropsとして渡す
  return <DesignPanel {...props} context={{slides, setSlides, currentSlideIndex, setSelectedElementId}} />
}
