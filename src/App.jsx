import { useCallback, useEffect, useRef, useState } from 'react'
import { PenLine } from 'lucide-react'
import { getAll, putEntry, deleteEntry, getDays, putDay, deleteDay } from './db'
import { ymd } from './utils'
import BottomNav from './components/BottomNav'
import ListView from './components/ListView'
import CalendarView from './components/CalendarView'
import SettingsView from './components/SettingsView'
import Editor from './components/Editor'
import Reader from './components/Reader'
import { popOverlay } from './components/Photos'

// 테마: system(폰 설정 따라감) / light / dark
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('diary-theme') || 'system' } catch { return 'system' }
  })
  useEffect(() => {
    const root = document.documentElement
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      if (theme === 'system') root.removeAttribute('data-theme')
      else root.setAttribute('data-theme', theme)
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0e1a27' : '#ffffff')
    }
    apply()
    try { localStorage.setItem('diary-theme', theme) } catch {}
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
  return [theme, setTheme]
}

export default function App() {
  const [entries, setEntries] = useState([])
  const [days, setDays] = useState({}) // 달력 꾸미기: 날짜 → { sticker, color, memo }
  const [loaded, setLoaded] = useState(false)
  const [view, setView] = useState('list')
  const [editor, setEditor] = useState(null) // { entry, date, key }
  const [readerId, setReaderId] = useState(null) // 읽고 있는 일기
  const [selDay, setSelDay] = useState(() => ymd(new Date()))
  const [toast, setToast] = useState('')
  const [theme, setTheme] = useTheme()

  const openRef = useRef(false)  // 편집기가 열려 있는지 (뒤로가기 처리용)
  const dirtyRef = useRef(false) // 저장 안 한 내용이 있는지
  const readerRef = useRef(false) // 읽기 화면이 열려 있는지
  const skipPop = useRef(false)  // 우리가 직접 부른 history.go 는 건너뛴다
  const toastTimer = useRef()

  const reload = useCallback(async () => {
    setEntries(await getAll())
    setDays(Object.fromEntries((await getDays()).map((d) => [d.date, d])))
    setLoaded(true)
  }, [])

  // 달력 한 칸을 꾸민다. 스티커·형광펜·메모가 모두 비면 그 날 기록을 지운다
  const decorate = useCallback((date, patch) => {
    setDays((prev) => {
      const next = { sticker: '', color: '', memo: '', ...prev[date], ...patch, date, updatedAt: Date.now() }
      const copy = { ...prev }
      if (next.sticker || next.color || next.memo) { copy[date] = next; putDay(next) }
      else { delete copy[date]; deleteDay(date) }
      return copy
    })
  }, [])

  useEffect(() => {
    reload()
    navigator.storage?.persist?.().catch(() => {})
  }, [reload])

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 1800)
  }, [])

  // 안드로이드 뒤로가기 버튼으로 편집기가 닫히도록 히스토리를 하나 쌓는다
  const openEditor = useCallback((entry, date) => {
    openRef.current = true
    dirtyRef.current = false
    setEditor({ entry: entry || null, date: entry?.date || date || ymd(new Date()), key: Date.now() })
    history.pushState({ editor: true }, '')
  }, [])

  // 읽기 화면도 뒤로가기로 닫힌다. 읽기 → 고치기 순으로 겹쳐 열릴 수 있다
  const openReader = useCallback((entry) => {
    readerRef.current = true
    setReaderId(entry.id)
    history.pushState({ reader: true }, '')
  }, [])

  useEffect(() => {
    const onPop = () => {
      if (skipPop.current) { skipPop.current = false; return }
      if (popOverlay()) return
      if (openRef.current) {
        if (dirtyRef.current && !confirm('저장하지 않은 내용이 있어요. 나갈까요?')) {
          history.pushState({ editor: true }, '')
          return
        }
        openRef.current = false
        setEditor(null)
        return
      }
      if (readerRef.current) {
        readerRef.current = false
        setReaderId(null)
      }
    }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  // 저장·삭제 뒤 편집기를 닫는다. 지운 일기는 읽기 화면도 함께 닫는다
  const finishEditing = (closeReader = false) => {
    let steps = 1
    openRef.current = false
    setEditor(null)
    if (closeReader && readerRef.current) {
      readerRef.current = false
      setReaderId(null)
      steps = 2
    }
    skipPop.current = true
    history.go(-steps)
  }

  const save = async (entry) => {
    await putEntry(entry)
    setSelDay(entry.date)
    await reload()
    finishEditing()
    showToast('저장했어요')
  }

  const remove = async (id) => {
    await deleteEntry(id)
    await reload()
    finishEditing(true)
    showToast('지웠어요')
  }

  const openEntry = (entry) => (entry ? openReader(entry) : openEditor(null))
  const reading = readerId && entries.find((e) => e.id === readerId)

  const changeView = (v) => {
    setView(v)
    scrollTo(0, 0)
  }

  return (
    <>
      <main className="app">
        {view === 'list' && <ListView entries={entries} loaded={loaded} onOpen={openEntry} />}
        {view === 'cal' && <CalendarView entries={entries} days={days} onDecorate={decorate} selDay={selDay} setSelDay={setSelDay} onOpen={openEntry} />}
        {view === 'set' && <SettingsView entries={entries} days={days} theme={theme} setTheme={setTheme} reload={reload} toast={showToast} />}
      </main>

      {view !== 'set' && (
        <button className="fab" onClick={() => openEditor(null, view === 'cal' ? selDay : undefined)} aria-label="새 일기 쓰기">
          <PenLine size={20} strokeWidth={2.4} />
          쓰기
        </button>
      )}

      <BottomNav view={view} onChange={changeView} />

      {reading && (
        <Reader
          entry={reading}
          entries={entries}
          onEdit={(e) => openEditor(e)}
          onMove={(e) => setReaderId(e.id)}
          onClose={() => history.back()}
        />
      )}

      {editor && (
        <Editor
          key={editor.key}
          entry={editor.entry}
          initialDate={editor.date}
          dirtyRef={dirtyRef}
          onSave={save}
          onDelete={remove}
          onClose={() => history.back()}
          toast={showToast}
        />
      )}

      <div className={`toast ${toast ? 'on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </>
  )
}
