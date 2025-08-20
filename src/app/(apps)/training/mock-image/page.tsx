'use client'

import React, {useState, useMemo, useCallback, useEffect, useRef} from 'react'

// --- 外部ライブラリの依存を削除 ---

// --- サンプルデータ ---
const initialExerciseMasters = [
  {id: 1, part: '胸', name: 'ベンチプレス', unit: 'kg'},
  {id: 2, part: '胸', name: 'ダンベルフライ', unit: 'kg'},
  {id: 3, part: '足', name: 'スクワット', unit: 'kg'},
  {id: 4, part: '足', name: 'レッグプレス', unit: 'kg'},
  {id: 5, part: '肩', name: 'ショルダープレス', unit: 'kg'},
  {id: 6, part: '背中', name: 'デッドリフト', unit: 'kg'},
  {id: 7, part: '背中', name: '懸垂', unit: 'kg'},
  {id: 8, part: '腕', name: 'アームカール', unit: 'kg'},
  {id: 9, part: '有酸素', name: 'ランニング', unit: 'min'},
  {id: 10, part: '有酸素', name: 'バイク', unit: 'min'},
]

const initialWorkoutLog = [
  // ... (前回の110件のデータは省略) ...
  {id: 1, exercise_id: 3, date: '2025-08-01', strength: 120, reps: 8},
  {id: 2, exercise_id: 9, date: '2025-08-01', strength: 30, reps: 1},
  {id: 3, exercise_id: 1, date: '2025-08-02', strength: 80, reps: 10},
  {id: 4, exercise_id: 6, date: '2025-08-02', strength: 140, reps: 5},
  {id: 5, exercise_id: 8, date: '2025-08-02', strength: 15, reps: 12},
  {id: 6, exercise_id: 3, date: '2025-08-03', strength: 122.5, reps: 8},
  {id: 7, exercise_id: 5, date: '2025-08-03', strength: 40, reps: 10},
  {id: 8, exercise_id: 10, date: '2025-08-04', strength: 45, reps: 1},
  {id: 9, exercise_id: 2, date: '2025-08-05', strength: 20, reps: 12},
  {id: 10, exercise_id: 7, date: '2025-08-05', strength: 0, reps: 10},
  {id: 11, exercise_id: 4, date: '2025-08-06', strength: 180, reps: 10},
  {id: 12, exercise_id: 9, date: '2025-08-06', strength: 30, reps: 1},
  {id: 13, exercise_id: 1, date: '2025-08-07', strength: 82.5, reps: 8},
  {id: 14, exercise_id: 6, date: '2025-08-07', strength: 145, reps: 5},
  {id: 15, exercise_id: 3, date: '2025-08-08', strength: 125, reps: 8},
  {id: 16, exercise_id: 8, date: '2025-08-08', strength: 15, reps: 10},
  {id: 17, exercise_id: 10, date: '2025-08-09', strength: 45, reps: 1},
  {id: 18, exercise_id: 5, date: '2025-08-09', strength: 42.5, reps: 8},
  {id: 19, exercise_id: 2, date: '2025-08-10', strength: 22.5, reps: 10},
  {id: 20, exercise_id: 7, date: '2025-08-10', strength: 0, reps: 12},
  {id: 21, exercise_id: 9, date: '2025-08-11', strength: 35, reps: 1},
  {id: 22, exercise_id: 4, date: '2025-08-11', strength: 185, reps: 8},
  {id: 23, exercise_id: 1, date: '2025-08-12', strength: 82.5, reps: 9},
  {id: 24, exercise_id: 6, date: '2025-08-12', strength: 145, reps: 6},
  {id: 25, exercise_id: 3, date: '2025-08-13', strength: 125, reps: 9},
  {id: 26, exercise_id: 10, date: '2025-08-13', strength: 50, reps: 1},
  {id: 27, exercise_id: 8, date: '2025-08-14', strength: 17.5, reps: 10},
  {id: 28, exercise_id: 5, date: '2025-08-14', strength: 42.5, reps: 9},
  {id: 29, exercise_id: 2, date: '2025-08-15', strength: 22.5, reps: 11},
  {id: 30, exercise_id: 9, date: '2025-08-15', strength: 35, reps: 1},
  {id: 31, exercise_id: 7, date: '2025-08-16', strength: 0, reps: 13},
  {id: 32, exercise_id: 4, date: '2025-08-16', strength: 185, reps: 9},
  {id: 33, exercise_id: 1, date: '2025-08-17', strength: 85, reps: 8},
  {id: 34, exercise_id: 6, date: '2025-08-17', strength: 150, reps: 5},
  {id: 35, exercise_id: 10, date: '2025-08-18', strength: 50, reps: 1},
  {id: 36, exercise_id: 3, date: '2025-08-18', strength: 127.5, reps: 8},
  {id: 37, exercise_id: 8, date: '2025-08-19', strength: 17.5, reps: 11},
  {id: 38, exercise_id: 5, date: '2025-08-19', strength: 45, reps: 8},
  {id: 39, exercise_id: 9, date: '2025-08-20', strength: 40, reps: 1},
  {id: 40, exercise_id: 2, date: '2025-08-20', strength: 25, reps: 10},
  {id: 41, exercise_id: 7, date: '2025-08-21', strength: 5, reps: 8},
  {id: 42, exercise_id: 4, date: '2025-08-21', strength: 190, reps: 8},
  {id: 43, exercise_id: 1, date: '2025-08-22', strength: 85, reps: 9},
  {id: 44, exercise_id: 10, date: '2025-08-22', strength: 55, reps: 1},
  {id: 45, exercise_id: 6, date: '2025-08-23', strength: 150, reps: 6},
  {id: 46, exercise_id: 3, date: '2025-08-23', strength: 127.5, reps: 9},
  {id: 47, exercise_id: 8, date: '2025-08-24', strength: 20, reps: 10},
  {id: 48, exercise_id: 5, date: '2025-08-24', strength: 45, reps: 9},
  {id: 49, exercise_id: 9, date: '2025-08-25', strength: 40, reps: 1},
  {id: 50, exercise_id: 2, date: '2025-08-25', strength: 25, reps: 11},
  {id: 51, exercise_id: 7, date: '2025-08-26', strength: 5, reps: 9},
  {id: 52, exercise_id: 4, date: '2025-08-26', strength: 190, reps: 9},
  {id: 53, exercise_id: 10, date: '2025-08-27', strength: 60, reps: 1},
  {id: 54, exercise_id: 1, date: '2025-08-27', strength: 87.5, reps: 8},
  {id: 55, exercise_id: 6, date: '2025-08-28', strength: 155, reps: 5},
  {id: 56, exercise_id: 3, date: '2025-08-28', strength: 130, reps: 8},
  {id: 57, exercise_id: 8, date: '2025-08-29', strength: 20, reps: 11},
  {id: 58, exercise_id: 9, date: '2025-08-29', strength: 45, reps: 1},
  {id: 59, exercise_id: 5, date: '2025-08-30', strength: 47.5, reps: 8},
  {id: 60, exercise_id: 2, date: '2025-08-30', strength: 27.5, reps: 10},
  {id: 61, exercise_id: 7, date: '2025-08-31', strength: 5, reps: 10},
  {id: 62, exercise_id: 4, date: '2025-08-31', strength: 195, reps: 8},
  {id: 63, exercise_id: 1, date: '2025-08-01', strength: 80, reps: 8},
  {id: 64, exercise_id: 5, date: '2025-08-01', strength: 40, reps: 9},
  {id: 65, exercise_id: 9, date: '2025-08-02', strength: 30, reps: 1},
  {id: 66, exercise_id: 2, date: '2025-08-03', strength: 20, reps: 10},
  {id: 67, exercise_id: 8, date: '2025-08-03', strength: 15, reps: 11},
  {id: 68, exercise_id: 4, date: '2025-08-04', strength: 180, reps: 8},
  {id: 69, exercise_id: 7, date: '2025-08-04', strength: 0, reps: 11},
  {id: 70, exercise_id: 10, date: '2025-08-05', strength: 45, reps: 1},
  {id: 71, exercise_id: 3, date: '2025-08-05', strength: 122.5, reps: 9},
  {id: 72, exercise_id: 6, date: '2025-08-06', strength: 140, reps: 6},
  {id: 73, exercise_id: 1, date: '2025-08-06', strength: 82.5, reps: 8},
  {id: 74, exercise_id: 9, date: '2025-08-07', strength: 35, reps: 1},
  {id: 75, exercise_id: 5, date: '2025-08-07', strength: 42.5, reps: 8},
  {id: 76, exercise_id: 2, date: '2025-08-08', strength: 22.5, reps: 10},
  {id: 77, exercise_id: 8, date: '2025-08-08', strength: 17.5, reps: 10},
  {id: 78, exercise_id: 10, date: '2025-08-09', strength: 50, reps: 1},
  {id: 79, exercise_id: 4, date: '2025-08-09', strength: 185, reps: 8},
  {id: 80, exercise_id: 7, date: '2025-08-10', strength: 0, reps: 12},
  {id: 81, exercise_id: 3, date: '2025-08-10', strength: 125, reps: 8},
  {id: 82, exercise_id: 6, date: '2025-08-11', strength: 145, reps: 5},
  {id: 83, exercise_id: 1, date: '2025-08-11', strength: 82.5, reps: 9},
  {id: 84, exercise_id: 9, date: '2025-08-12', strength: 35, reps: 1},
  {id: 85, exercise_id: 5, date: '2025-08-12', strength: 42.5, reps: 9},
  {id: 86, exercise_id: 2, date: '2025-08-13', strength: 22.5, reps: 11},
  {id: 87, exercise_id: 8, date: '2025-08-14', strength: 17.5, reps: 11},
  {id: 88, exercise_id: 10, date: '2025-08-14', strength: 50, reps: 1},
  {id: 89, exercise_id: 4, date: '2025-08-15', strength: 185, reps: 9},
  {id: 90, exercise_id: 7, date: '2025-08-15', strength: 5, reps: 8},
  {id: 91, exercise_id: 3, date: '2025-08-16', strength: 125, reps: 9},
  {id: 92, exercise_id: 6, date: '2025-08-16', strength: 150, reps: 5},
  {id: 93, exercise_id: 1, date: '2025-08-17', strength: 85, reps: 8},
  {id: 94, exercise_id: 9, date: '2025-08-17', strength: 40, reps: 1},
  {id: 95, exercise_id: 5, date: '2025-08-18', strength: 45, reps: 8},
  {id: 96, exercise_id: 2, date: '2025-08-18', strength: 25, reps: 10},
  {id: 97, exercise_id: 8, date: '2025-08-19', strength: 20, reps: 10},
  {id: 98, exercise_id: 10, date: '2025-08-19', strength: 55, reps: 1},
  {id: 99, exercise_id: 4, date: '2025-08-20', strength: 190, reps: 8},
  {id: 100, exercise_id: 7, date: '2025-08-20', strength: 5, reps: 9},
  {id: 101, exercise_id: 1, date: '2025-06-05', strength: 70, reps: 10},
  {id: 102, exercise_id: 1, date: '2025-06-12', strength: 72.5, reps: 8},
  {id: 103, exercise_id: 1, date: '2025-06-19', strength: 72.5, reps: 9},
  {id: 104, exercise_id: 1, date: '2025-07-03', strength: 75, reps: 8},
  {id: 105, exercise_id: 1, date: '2025-07-10', strength: 75, reps: 9},
  {id: 106, exercise_id: 1, date: '2025-07-17', strength: 77.5, reps: 8},
  {id: 107, exercise_id: 1, date: '2025-07-24', strength: 77.5, reps: 9},
  {id: 108, exercise_id: 3, date: '2025-07-01', strength: 110, reps: 8},
  {id: 109, exercise_id: 3, date: '2025-07-15', strength: 115, reps: 8},
]

// --- ヘルパー関数 ---
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`
  if (format === 'MM/DD') return `${month}/${day}`
  return `${year}-${month}-${day}`
}

// --- メインコンポーネント ---
export default function WorkoutTrackerApp() {
  // --- state管理 ---
  const [masters, setMasters] = useState(initialExerciseMasters)
  const [logList, setlogList] = useState(initialWorkoutLog)
  const [currentDate, setCurrentDate] = useState(new Date('2025-08-01'))
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date('2025-08-01')))
  const [view, setView] = useState('calendar') // 'calendar', 'logList', 'logForm', 'analysis', 'masterManagement'
  const [editingLog, setEditingLog] = useState(null)
  const [prefillData, setPrefillData] = useState(null)

  // --- メモ化された計算 ---
  const logDates = useMemo(() => new Set(logList.map(log => log.date)), [logList])

  const selectedDatelogList = useMemo(() => {
    return logList
      .filter(log => log.date === selectedDate)
      .map(log => ({...log, master: masters.find(m => m.id === log.exercise_id)}))
      .sort((a, b) => a.id - b.id)
  }, [logList, selectedDate, masters])

  const prLogIds = useMemo(() => {
    const prIds = new Set()
    const maxStrengths = {}
    const sortedlogList = [...logList].sort((a, b) => new Date(a.date) - new Date(b.date))

    sortedlogList.forEach(log => {
      if (!maxStrengths[log.exercise_id] || log.strength > maxStrengths[log.exercise_id]) {
        if (log.strength > 0) {
          maxStrengths[log.exercise_id] = log.strength
          prIds.add(log.id)
        }
      }
    })
    return prIds
  }, [logList])

  // --- イベントハンドラ ---
  const handleDateClick = dateStr => {
    setSelectedDate(dateStr)
    setView('logList')
  }

  const handleAddLog = newLog => {
    setlogList(prev => [...prev, {...newLog, id: Date.now(), date: selectedDate}])
    setView('logList')
  }

  const handleUpdateLog = updatedLog => {
    setlogList(prev => prev.map(log => (log.id === updatedLog.id ? updatedLog : log)))
    setView('logList')
    setEditingLog(null)
  }

  const handleDeleteLog = logId => {
    setlogList(prev => prev.filter(log => log.id !== logId))
  }

  const handleQuickAddSet = logToCopy => {
    const newLog = {...logToCopy, id: Date.now()}
    delete newLog.master
    setlogList(prev => [...prev, newLog].sort((a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id))
  }

  const showFormForNew = () => {
    setEditingLog(null)
    setPrefillData(null)
    setView('logForm')
  }

  const showFormForEdit = log => {
    setEditingLog(log)
    setPrefillData(null)
    setView('logForm')
  }

  // --- 画面表示ロジック ---
  const renderContent = () => {
    switch (view) {
      case 'calendar':
      case 'logList':
      case 'logForm':
        return (
          <>
            {view === 'calendar' && (
              <CalendarView
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                logDates={logDates}
                onDateClick={handleDateClick}
              />
            )}
            {view === 'logList' && (
              <LogListView
                selectedDate={selectedDate}
                logList={selectedDatelogList}
                onAdd={showFormForNew}
                onEdit={showFormForEdit}
                onQuickAdd={handleQuickAddSet}
                onDelete={handleDeleteLog}
                onBack={() => setView('calendar')}
                prLogIds={prLogIds}
              />
            )}
            {view === 'logForm' && (
              <LogFormView
                masters={masters}
                logList={logList}
                editingLog={editingLog}
                prefillData={prefillData}
                onSave={editingLog ? handleUpdateLog : handleAddLog}
                onCancel={() => setView('logList')}
              />
            )}
          </>
        )
      case 'analysis':
        return <AnalysisView logList={logList} masters={masters} prLogIds={prLogIds} />
      case 'masterManagement':
        return <MasterManagementView masters={masters} setMasters={setMasters} />
      default:
        return (
          <CalendarView
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            logDates={logDates}
            onDateClick={handleDateClick}
          />
        )
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20">
      <div className="container mx-auto max-w-lg p-4">
        <Header />
        {renderContent()}
      </div>
      <NavigationView view={view} setView={setView} />
    </div>
  )
}

// --- ナビゲーション ---
function NavigationView({view, setView}) {
  const isRecordView = ['calendar', 'logList', 'logForm'].includes(view)
  const navItems = [
    {id: 'calendar', label: '記録'},
    {id: 'analysis', label: '分析'},
    {id: 'masterManagement', label: '設定'},
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around max-w-lg mx-auto">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${(item.id === 'calendar' && isRecordView) || view === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

// --- UIコンポーネント群 ---
function Header() {
  return (
    <header className="mb-6 text-center">
      <h1 className="text-2xl font-bold text-slate-800">
        <span role="img" aria-label="dumbbell">
          💪
        </span>{' '}
        筋トレ記録
      </h1>
    </header>
  )
}
function CalendarView({currentDate, setCurrentDate, logDates, onDateClick}) {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDay = startOfMonth.getDay()
  const daysInMonth = endOfMonth.getDate()
  const days = [...Array(startDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)]

  const changeMonth = offset => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1))

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100">
          &lt;
        </button>
        <h2 className="font-bold text-lg">{`${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100">
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="font-semibold text-slate-500">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`}></div>
          const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
          const hasLog = logDates.has(dateStr)
          return (
            <div key={day} onClick={() => onDateClick(dateStr)} className="cursor-pointer">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto ${hasLog ? 'bg-blue-500 text-white font-bold' : 'hover:bg-slate-100'}`}
              >
                {day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LogListView({selectedDate, logList, onAdd, onEdit, onQuickAdd, onDelete, onBack, prLogIds}) {
  const {groupedlogList, sortedParts, totalVolume} = useMemo(() => {
    if (!logList || logList.length === 0) return {groupedlogList: {}, sortedParts: [], totalVolume: 0}
    const grouped = logList.reduce((acc, log) => {
      const part = log.master?.part || 'その他'
      if (!acc[part]) acc[part] = []
      acc[part].push(log)
      return acc
    }, {})
    const partOrder = ['胸', '背中', '肩', '腕', '足', '有酸素', 'その他']
    const sorted = Object.keys(grouped).sort((a, b) => partOrder.indexOf(a) - partOrder.indexOf(b))
    const volume = logList.reduce((sum, log) => sum + log.strength * log.reps, 0)
    return {groupedlogList: grouped, sortedParts: sorted, totalVolume: volume}
  }, [logList])

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <button onClick={onBack} className="text-blue-600 hover:underline">
          &lt; カレンダーへ
        </button>
        <h2 className="font-bold text-lg">{formatDate(selectedDate, 'MM/DD')}の記録</h2>
        <div className="w-20"></div>
      </div>
      <div className="text-center mb-4 p-2 bg-slate-100 rounded-md">
        <p className="text-sm text-slate-600">
          本日の総ボリューム: <span className="font-bold text-lg text-slate-800">{totalVolume.toLocaleString()}</span> kg
        </p>
      </div>
      {logList.length === 0 ? (
        <p className="text-slate-500 text-center py-8">この日の記録はありません。</p>
      ) : (
        <div className="space-y-4">
          {sortedParts.map(part => (
            <div key={part}>
              <h3 className="font-bold text-md text-slate-700 border-b-2 border-slate-200 pb-1 mb-2">{part}</h3>
              <ul className="space-y-2">
                {groupedlogList[part].map(log => (
                  <li key={log.id} className="p-3 bg-slate-50 rounded-lg flex items-center gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        {log.master.name}
                        {prLogIds.has(log.id) && (
                          <span className="text-xs font-bold text-white bg-yellow-500 px-2 py-0.5 rounded-full">PR</span>
                        )}
                      </p>
                      <p className="text-slate-600">
                        {log.strength} {log.master.unit} &times; {log.reps} 回
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onQuickAdd(log)}
                        className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 text-lg font-bold"
                        title="同じ内容でセットを追加"
                      >
                        +
                      </button>
                      <button onClick={() => onEdit(log)} className="text-sm text-blue-600 hover:underline">
                        編集
                      </button>
                      <button onClick={() => onDelete(log.id)} className="text-sm text-red-600 hover:underline">
                        削除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={onAdd}
        className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        新しい種目を記録する
      </button>
    </div>
  )
}

function LogFormView({masters, logList, editingLog, prefillData, onSave, onCancel}) {
  const initialData = editingLog || prefillData
  const editingExercise = useMemo(
    () => (initialData ? masters.find(m => m.id === initialData.exercise_id) : null),
    [initialData, masters]
  )

  const [part, setPart] = useState(editingExercise?.part || '')
  const [exerciseId, setExerciseId] = useState(initialData?.exercise_id || '')
  const [searchTerm, setSearchTerm] = useState(editingExercise?.name || '')
  const [strength, setStrength] = useState(initialData?.strength || '')
  const [reps, setReps] = useState(initialData?.reps || '')
  const [showResults, setShowResults] = useState(false)
  const searchWrapperRef = useRef(null)

  const filteredExercises = useMemo(() => {
    let results = masters
    if (part) results = results.filter(m => m.part === part)
    if (searchTerm) results = results.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return results
  }, [part, searchTerm, masters])

  useEffect(() => {
    const handleClickOutside = event => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) setShowResults(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchWrapperRef])

  const handleSearchChange = e => {
    setSearchTerm(e.target.value)
    setExerciseId('')
    setShowResults(true)
  }
  const handlePartChange = e => {
    setPart(e.target.value)
    setShowResults(true)
  }
  const handleSelectExercise = exercise => {
    setExerciseId(exercise.id)
    setSearchTerm(exercise.name)
    setPart(exercise.part)
    setShowResults(false)
  }
  const handleSubmit = e => {
    e.preventDefault()
    if (!exerciseId || strength === '' || reps === '') {
      alert('すべての項目を入力してください。')
      return
    }
    const logData = {exercise_id: parseInt(exerciseId), strength: parseFloat(strength), reps: parseInt(reps)}
    if (editingLog) {
      logData.id = editingLog.id
      logData.date = editingLog.date
    }
    onSave(logData)
  }

  const historicalData = useMemo(() => {
    if (!exerciseId) return {}
    const targetlogList = logList.filter(log => log.exercise_id === parseInt(exerciseId))
    if (targetlogList.length === 0) return {}

    const epley = (s, r) => s * (1 + r / 30)

    const maxStrengthLog = targetlogList.reduce((max, log) => (log.strength > max.strength ? log : max))
    const maxRepsLog = targetlogList.reduce((max, log) => (log.reps > max.reps ? log : max))
    const maxVolumeLog = targetlogList.reduce((max, log) => (log.strength * log.reps > max.strength * max.reps ? log : max))
    const bestE1RMLog = targetlogList.reduce((best, log) =>
      epley(log.strength, log.reps) > epley(best.strength, best.reps) ? log : best
    )

    const today = new Date('2025-08-31')
    const threeMonthsAgo = new Date(today)
    threeMonthsAgo.setMonth(today.getMonth() - 3)

    const recentlogList = targetlogList.filter(log => new Date(log.date) >= threeMonthsAgo)

    const getWeekId = date => {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const weekStart = new Date(d.setDate(diff))
      return formatDate(weekStart)
    }

    const weeklyMaxStrength = recentlogList.reduce((acc, log) => {
      const weekId = getWeekId(log.date)
      if (!acc[weekId] || log.strength > acc[weekId]) {
        acc[weekId] = log.strength
      }
      return acc
    }, {})

    const threeMonthProgress = Object.entries(weeklyMaxStrength)
      .map(([week, maxStrength]) => ({
        label: formatDate(week, 'MM/DD'),
        value: maxStrength,
      }))
      .sort((a, b) => new Date(a.label) - new Date(b.label))

    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const monthlogList = targetlogList.filter(log => new Date(log.date) >= oneMonthAgo)
    let monthlyAvg = null
    if (monthlogList.length > 0) {
      const totalStrength = monthlogList.reduce((sum, log) => sum + log.strength, 0)
      const totalReps = monthlogList.reduce((sum, log) => sum + log.reps, 0)
      monthlyAvg = {
        strength: (totalStrength / monthlogList.length).toFixed(1),
        reps: (totalReps / monthlogList.length).toFixed(1),
      }
    }

    return {maxStrengthLog, maxRepsLog, monthlyAvg, maxVolumeLog, bestE1RMLog, threeMonthProgress}
  }, [exerciseId, logList])

  const unit = masters.find(m => m.id === parseInt(exerciseId))?.unit || 'kg'

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="font-bold text-lg text-center mb-4">{editingLog ? '記録を編集' : '記録を追加'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          <div className="col-span-2">
            <label htmlFor="part" className="block text-sm font-medium text-slate-700">
              部位
            </label>
            <select
              id="part"
              value={part}
              onChange={handlePartChange}
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべて</option>
              {[...new Set(masters.map(m => m.part))].map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="relative col-span-3" ref={searchWrapperRef}>
            <label htmlFor="exercise-search" className="block text-sm font-medium text-slate-700">
              種目検索
            </label>
            <input
              id="exercise-search"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowResults(true)}
              placeholder="例: ベンチプレス"
              autoComplete="off"
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {showResults && (
              <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                {filteredExercises.length > 0 ? (
                  filteredExercises.map(ex => (
                    <li
                      key={ex.id}
                      onClick={() => handleSelectExercise(ex)}
                      className="px-4 py-2 hover:bg-slate-100 cursor-pointer"
                    >
                      {ex.name} <span className="text-xs text-slate-400">({ex.part})</span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-slate-500">見つかりません</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {exerciseId && historicalData.maxStrengthLog && (
          <div className="p-3 bg-slate-100 rounded-lg space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-center mb-2 text-slate-700">過去のパフォーマンス</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded">
                  <p className="text-xs text-slate-500">最高強度</p>
                  <p className="font-bold">
                    {historicalData.maxStrengthLog.strength}
                    {unit}
                  </p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-xs text-slate-500">最高回数</p>
                  <p className="font-bold">{historicalData.maxRepsLog.reps}回</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-xs text-slate-500">最高Volume</p>
                  <p className="font-bold">
                    {(historicalData.maxVolumeLog.strength * historicalData.maxVolumeLog.reps).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-xs text-slate-500">月間平均強度</p>
                  <p className="font-bold">{historicalData.monthlyAvg ? `${historicalData.monthlyAvg.strength}${unit}` : '-'}</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-xs text-slate-500">月間平均回数</p>
                  <p className="font-bold">{historicalData.monthlyAvg ? `${historicalData.monthlyAvg.reps}回` : '-'}</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-xs text-slate-500">推定1RM</p>
                  <p className="font-bold">
                    {(historicalData.bestE1RMLog.strength * (1 + historicalData.bestE1RMLog.reps / 30)).toFixed(1)}
                    {unit}
                  </p>
                </div>
              </div>
            </div>
            {historicalData.threeMonthProgress && historicalData.threeMonthProgress.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-center mb-2 text-slate-700">過去3ヶ月の強度推移 (週ごと)</h3>
                <StrengthBarChart data={historicalData.threeMonthProgress} />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="strength" className="block text-sm font-medium text-slate-700">
              強度 ({unit})
            </label>
            <input
              type="number"
              id="strength"
              value={strength}
              onChange={e => setStrength(e.target.value)}
              disabled={!exerciseId}
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>
          <div>
            <label htmlFor="reps" className="block text-sm font-medium text-slate-700">
              回数
            </label>
            <input
              type="number"
              id="reps"
              value={reps}
              onChange={e => setReps(e.target.value)}
              disabled={!exerciseId}
              className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>
        </div>
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-slate-200 text-slate-800 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}

// --- 自作グラフコンポーネント ---
function StrengthBarChart({data}) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(0)
  const height = 150
  const margin = {top: 20, right: 0, bottom: 20, left: 25}
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  useEffect(() => {
    if (containerRef.current) setWidth(containerRef.current.offsetWidth)
    const handleResize = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!data || data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const yScale = chartHeight / maxValue
  const barWidth = chartWidth / data.length

  return (
    <div ref={containerRef} className="w-full h-[150px] bg-white p-2 rounded">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#cbd5e1" />
          <text x="-5" y="0" dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
            {maxValue}
          </text>
          <text x="-5" y={chartHeight} dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
            0
          </text>
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#cbd5e1" />
          {data.map((d, i) => {
            const barHeight = d.value * yScale
            return (
              <g key={i} transform={`translate(${i * barWidth}, 0)`}>
                <rect x={barWidth * 0.1} y={chartHeight - barHeight} width={barWidth * 0.8} height={barHeight} fill="#3b82f6" />
                <text x={barWidth / 2} y={chartHeight - barHeight - 5} textAnchor="middle" fontSize="10" fill="#475569">
                  {d.value}
                </text>
                <text x={barWidth / 2} y={chartHeight + 15} textAnchor="middle" fontSize="10" fill="#64748b">
                  {d.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

function CustomPieChart({data, colors}) {
  const containerRef = useRef(null)
  const [size, setSize] = useState(250)
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.7

  useEffect(() => {
    if (containerRef.current) setSize(containerRef.current.offsetWidth)
    const handleResize = () => {
      if (containerRef.current) setSize(containerRef.current.offsetWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const total = data.reduce((sum, item) => sum + item.value, 0)
  let startAngle = -Math.PI / 2

  const getArcPath = (startAngle, endAngle) => {
    const startX = cx + radius * Math.cos(startAngle)
    const startY = cy + radius * Math.sin(startAngle)
    const endX = cx + radius * Math.cos(endAngle)
    const endY = cy + radius * Math.sin(endAngle)
    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'
    return `M ${cx},${cy} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`
  }

  return (
    <div className="flex flex-col items-center">
      <svg ref={containerRef} width="100%" height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const sliceAngle = (item.value / total) * 2 * Math.PI
          const endAngle = startAngle + sliceAngle
          const path = getArcPath(startAngle, endAngle)
          const color = colors[index % colors.length]
          startAngle = endAngle
          return <path key={index} d={path} fill={color} />
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colors[index % colors.length]}}></span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomLineChart({data, dataKey, strokeColor}) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(0)
  const height = 200
  const margin = {top: 20, right: 10, bottom: 20, left: 30}
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  useEffect(() => {
    if (containerRef.current) setWidth(containerRef.current.offsetWidth)
    const handleResize = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!data || data.length < 2) return null

  const values = data.map(d => d[dataKey])
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const yRange = maxValue - minValue === 0 ? 1 : maxValue - minValue

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * chartWidth
      const y = chartHeight - ((d[dataKey] - minValue) / yRange) * chartHeight
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div ref={containerRef} className="w-full h-[200px]">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#e2e8f0" />
          <text x="-5" y="0" dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
            {maxValue.toFixed(0)}
          </text>
          <text x="-5" y={chartHeight} dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
            {minValue.toFixed(0)}
          </text>
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#e2e8f0" />
          {data.map((d, i) => (
            <text
              key={i}
              x={(i / (data.length - 1)) * chartWidth}
              y={chartHeight + 15}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {formatDate(d.date, 'MM/DD')}
            </text>
          ))}
          <polyline fill="none" stroke={strokeColor} strokeWidth="2" points={points} />
        </g>
      </svg>
    </div>
  )
}

function CustomMultiBarChart({data, keys, colors}) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(0)
  const height = 250
  const margin = {top: 20, right: 10, bottom: 40, left: 30}
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  useEffect(() => {
    if (containerRef.current) setWidth(containerRef.current.offsetWidth)
    const handleResize = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!data || data.length === 0) return null

  const maxValue = Math.max(...data.map(d => Math.max(...keys.map(k => d[k.key]))))
  const yScale = chartHeight / maxValue
  const groupWidth = chartWidth / data.length
  const barWidth = (groupWidth * 0.8) / keys.length

  return (
    <div ref={containerRef} className="w-full h-[250px]">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <line x1="0" y1="0" x2="0" y2={chartHeight} stroke="#e2e8f0" />
          <text x="-5" y="0" dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
            {maxValue.toLocaleString()}
          </text>
          <text x="-5" y={chartHeight} dy="0.32em" textAnchor="end" fontSize="10" fill="#64748b">
            0
          </text>
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#e2e8f0" />
          {data.map((d, i) => (
            <g key={i} transform={`translate(${i * groupWidth}, 0)`}>
              {keys.map((k, j) => {
                const barHeight = d[k.key] * yScale
                return (
                  <rect
                    key={j}
                    x={groupWidth * 0.1 + j * barWidth}
                    y={chartHeight - barHeight}
                    width={barWidth * 0.9}
                    height={barHeight}
                    fill={colors[j % colors.length]}
                  />
                )
              })}
              <text x={groupWidth / 2} y={chartHeight + 15} textAnchor="middle" fontSize="10" fill="#64748b">
                {d.name}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 mt-2 text-sm">
        {keys.map((k, i) => (
          <div key={i} className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colors[i % colors.length]}}></span>
            <span>{k.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- 更新された分析コンポーネント ---
function AnalysisView({logList, masters, prLogIds}) {
  const [subView, setSubView] = useState('dashboard') // 'dashboard', 'exercise'
  const [analysisType, setAnalysisType] = useState('volume') // 'volume', 'reps'

  return (
    <div className="space-y-4">
      <div className="flex bg-slate-200 rounded-lg p-1">
        <button
          onClick={() => setSubView('dashboard')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${subView === 'dashboard' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}
        >
          月間ダッシュボード
        </button>
        <button
          onClick={() => setSubView('exercise')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${subView === 'exercise' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}
        >
          種目別分析
        </button>
      </div>
      {subView === 'dashboard' && (
        <>
          <div className="flex bg-slate-200 rounded-lg p-1 mt-4">
            <button
              onClick={() => setAnalysisType('volume')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${analysisType === 'volume' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}
            >
              ボリューム基準
            </button>
            <button
              onClick={() => setAnalysisType('reps')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${analysisType === 'reps' ? 'bg-white text-blue-600 shadow' : 'text-slate-600'}`}
            >
              回数基準
            </button>
          </div>
          <MonthlyDashboardView logList={logList} masters={masters} prLogIds={prLogIds} analysisType={analysisType} />
        </>
      )}
      {subView === 'exercise' && <ExerciseAnalysisView logList={logList} masters={masters} />}
    </div>
  )
}

function MonthlyDashboardView({logList, masters, prLogIds, analysisType}) {
  const [currentMonth, setCurrentMonth] = useState(new Date('2025-08-01'))

  const {monthlyStats, monthlyHistory} = useMemo(() => {
    const calculateStatsForMonth = date => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthlogList = logList.filter(log => {
        const logDate = new Date(log.date)
        return logDate.getFullYear() === year && logDate.getMonth() === month
      })
      const totalVolume = monthlogList.reduce((sum, log) => sum + log.strength * log.reps, 0)
      const totalReps = monthlogList.reduce((sum, log) => sum + log.reps, 0)
      const totalSets = monthlogList.length
      const trainingDays = new Set(monthlogList.map(log => log.date)).size
      const monthPrIds = new Set(monthlogList.map(l => l.id))
      const prCount = [...prLogIds].filter(id => monthPrIds.has(id)).length

      const volumeByPart = monthlogList.reduce((acc, log) => {
        const master = masters.find(m => m.id === log.exercise_id)
        if (!master) return acc
        const part = master.part
        const volume = log.strength * log.reps
        if (!acc[part]) acc[part] = 0
        acc[part] += volume
        return acc
      }, {})
      const pieData = Object.entries(volumeByPart)
        .map(([name, value]) => ({name, value}))
        .sort((a, b) => b.value - a.value)

      const repsByPart = monthlogList.reduce((acc, log) => {
        const master = masters.find(m => m.id === log.exercise_id)
        if (!master) return acc
        const part = master.part
        if (!acc[part]) acc[part] = 0
        acc[part] += log.reps
        return acc
      }, {})
      const repPieData = Object.entries(repsByPart)
        .map(([name, value]) => ({name, value}))
        .sort((a, b) => b.value - a.value)

      return {
        name: `${year}/${String(month + 1).padStart(2, '0')}`,
        totalVolume,
        totalSets,
        trainingDays,
        prCount,
        pieData,
        totalReps,
        repPieData,
      }
    }

    const history = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentMonth)
      date.setMonth(currentMonth.getMonth() - i)
      history.push(calculateStatsForMonth(date))
    }

    return {monthlyStats: history[5], monthlyHistory: history}
  }, [currentMonth, logList, masters, prLogIds])

  const changeMonth = offset => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943']
  const barChartKeys = [
    {key: 'trainingDays', name: '日数', color: '#8884d8'},
    {key: 'totalSets', name: 'セット数', color: '#82ca9d'},
    {key: 'totalVolume', name: 'ボリューム', color: '#ffc658'},
    {key: 'totalReps', name: 'レップ数', color: '#ff8042'},
  ]

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100">
          &lt;
        </button>
        <h2 className="font-bold text-lg">{`${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100">
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-100 p-3 rounded-lg text-center">
          <p className="text-sm text-slate-600">トレーニング日数</p>
          <p className="text-2xl font-bold">
            {monthlyStats.trainingDays} <span className="text-base font-normal">日</span>
          </p>
        </div>
        <div className="bg-slate-100 p-3 rounded-lg text-center">
          <p className="text-sm text-slate-600">総セット数</p>
          <p className="text-2xl font-bold">
            {monthlyStats.totalSets} <span className="text-base font-normal">回</span>
          </p>
        </div>
        <div className="bg-slate-100 p-3 rounded-lg text-center">
          <p className="text-sm text-slate-600">総ボリューム</p>
          <p className="text-2xl font-bold">
            {monthlyStats.totalVolume.toLocaleString()} <span className="text-base font-normal">kg</span>
          </p>
        </div>
        <div className="bg-slate-100 p-3 rounded-lg text-center">
          <p className="text-sm text-slate-600">PR更新数</p>
          <p className="text-2xl font-bold">
            {monthlyStats.prCount} <span className="text-base font-normal">回</span>
          </p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-center">{analysisType === 'volume' ? '部位別ボリューム' : '部位別レップ数'}</h3>
        {monthlyStats.pieData.length > 0 ? (
          <CustomPieChart data={analysisType === 'volume' ? monthlyStats.pieData : monthlyStats.repPieData} colors={COLORS} />
        ) : (
          <p className="text-center text-slate-500 py-8">この月の記録はありません。</p>
        )}
      </div>
      <div>
        <h3 className="font-semibold mb-2 text-center">月間推移</h3>
        <CustomMultiBarChart
          data={monthlyHistory}
          keys={barChartKeys.slice(0, 2)}
          colors={barChartKeys.map(k => k.color).slice(0, 2)}
        />
        <CustomMultiBarChart
          data={monthlyHistory}
          keys={analysisType === 'volume' ? [barChartKeys[2]] : [barChartKeys[3]]}
          colors={analysisType === 'volume' ? [barChartKeys[2].color] : [barChartKeys[3].color]}
        />
      </div>
    </div>
  )
}

function ExerciseAnalysisView({logList, masters}) {
  const {groupedMasters, sortedParts} = useMemo(() => {
    const grouped = masters.reduce((acc, master) => {
      const part = master.part
      if (!acc[part]) acc[part] = []
      acc[part].push(master)
      return acc
    }, {})
    const partOrder = ['胸', '背中', '肩', '腕', '足', '有酸素', 'その他']
    const sorted = Object.keys(grouped).sort((a, b) => partOrder.indexOf(a) - partOrder.indexOf(b))
    return {groupedMasters: grouped, sortedParts: sorted}
  }, [masters])

  return (
    <div className="space-y-6">
      {sortedParts.map(part => (
        <div key={part} className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-bold text-xl text-center mb-4">{part}</h2>
          <div className="space-y-4">
            {groupedMasters[part].map(master => (
              <ExerciseChart key={master.id} master={master} logList={logList} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ExerciseChart({master, logList}) {
  const chartData = useMemo(() => {
    const filteredlogList = logList
      .filter(log => log.exercise_id === master.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    const dataByDate = filteredlogList.reduce((acc, log) => {
      if (!acc[log.date]) acc[log.date] = {date: log.date, totalVolume: 0, maxStrength: 0, totalReps: 0}
      acc[log.date].totalVolume += log.strength * log.reps
      acc[log.date].totalReps += log.reps
      if (log.strength > acc[log.date].maxStrength) acc[log.date].maxStrength = log.strength
      return acc
    }, {})
    return Object.values(dataByDate)
  }, [master.id, logList])

  return (
    <div className="border-t pt-4">
      <h3 className="font-bold text-lg mb-2">{master.name}</h3>
      {chartData.length > 1 ? (
        <>
          <div>
            <h4 className="font-semibold mb-1 text-sm text-slate-600">トレーニングボリューム ({master.unit})</h4>
            <CustomLineChart data={chartData} dataKey="totalVolume" strokeColor="#8884d8" />
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-sm text-slate-600">最大挙上重量 ({master.unit})</h4>
            <CustomLineChart data={chartData} dataKey="maxStrength" strokeColor="#82ca9d" />
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-sm text-slate-600">合計レップ数</h4>
            <CustomLineChart data={chartData} dataKey="totalReps" strokeColor="#ffc658" />
          </div>
        </>
      ) : (
        <p className="text-center text-slate-500 py-4 text-sm">表示するには2日以上の記録が必要です。</p>
      )}
    </div>
  )
}

function MasterManagementView({masters, setMasters}) {
  const [editingMaster, setEditingMaster] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleAddNew = () => {
    setEditingMaster({id: null, part: '', name: '', unit: 'kg'})
    setIsFormOpen(true)
  }
  const handleEdit = master => {
    setEditingMaster(master)
    setIsFormOpen(true)
  }
  const handleDelete = masterId => {
    if (confirm('この種目を削除しますか？関連するログは残ります。')) setMasters(prev => prev.filter(m => m.id !== masterId))
  }
  const handleSave = masterToSave => {
    if (masterToSave.id) setMasters(prev => prev.map(m => (m.id === masterToSave.id ? masterToSave : m)))
    else setMasters(prev => [...prev, {...masterToSave, id: Date.now()}])
    setIsFormOpen(false)
    setEditingMaster(null)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <h2 className="font-bold text-lg text-center">種目マスタ設定</h2>
      {!isFormOpen ? (
        <>
          <ul className="space-y-2">
            {masters.map(m => (
              <li key={m.id} className="p-3 bg-slate-50 rounded-lg flex items-center">
                <div className="flex-1">
                  <p className="font-semibold">
                    {m.name} <span className="text-sm text-slate-500">({m.part})</span>
                  </p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleEdit(m)} className="text-sm text-blue-600 hover:underline">
                    編集
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="text-sm text-red-600 hover:underline">
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={handleAddNew}
            className="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
          >
            新規種目を追加
          </button>
        </>
      ) : (
        <MasterForm master={editingMaster} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
      )}
    </div>
  )
}

function MasterForm({master, onSave, onCancel}) {
  const [formData, setFormData] = useState(master)
  const handleChange = e => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }
  const handleSubmit = e => {
    e.preventDefault()
    if (!formData.name || !formData.part) {
      alert('部位と項目名を入力してください。')
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold">{master.id ? '種目を編集' : '新規種目を追加'}</h3>
      <div>
        <label htmlFor="part" className="block text-sm font-medium text-slate-700">
          部位
        </label>
        <input
          type="text"
          name="part"
          value={formData.part}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          項目名
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="unit" className="block text-sm font-medium text-slate-700">
          単位
        </label>
        <input
          type="text"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
        />
      </div>
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="w-full bg-slate-200 text-slate-800 font-bold py-3 rounded-lg hover:bg-slate-300"
        >
          キャンセル
        </button>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
          保存
        </button>
      </div>
    </form>
  )
}
