import { useEffect, useRef, useState } from 'react'
import { Download, HardDrive, Monitor, Moon, Palette, Sun, Trash2, Upload } from 'lucide-react'
import { putEntry, putDay, clearAll } from '../db'
import { HIGHLIGHTS, MOODS, STICKERS, WEATHERS, ymd, sortEntries } from '../utils'
import { MAX_PHOTOS, blobToDataUrl, dataUrlToBlob } from './Photos'

const THEMES = [
  { id: 'system', label: '시스템', Icon: Monitor },
  { id: 'light', label: '라이트', Icon: Sun },
  { id: 'dark', label: '다크', Icon: Moon },
]

export default function SettingsView({ entries, days, theme, setTheme, reload, toast }) {
  const fileRef = useRef()
  const [persisted, setPersisted] = useState(null)

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => {})
  }, [])

  const exportJson = async () => {
    // 사진은 파일 안에 글자(data URL)로 함께 담는다
    const list = await Promise.all(sortEntries(entries).map(async (e) => ({
      ...e,
      photos: await Promise.all((e.photos || []).map(async (p) => ({ id: p.id, w: p.w, h: p.h, data: await blobToDataUrl(p.blob) }))),
    })))
    const data = JSON.stringify({ app: 'my-diary', version: 2, exportedAt: new Date().toISOString(), entries: list, days: Object.values(days) })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    a.download = `일기백업_${ymd(new Date())}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    toast(`${entries.length}개를 내보냈어요`)
  }

  // 같은 id 는 더 최근에 고친 쪽을 남긴다
  const importJson = async (ev) => {
    const f = ev.target.files[0]
    ev.target.value = ''
    if (!f) return
    try {
      const data = JSON.parse(await f.text())
      const list = Array.isArray(data) ? data : data.entries
      if (!Array.isArray(list)) throw new Error('format')
      const have = Object.fromEntries(entries.map((x) => [x.id, x]))
      const moods = MOODS.map((m) => m.e)
      const weathers = WEATHERS.map((w) => w.e)
      let n = 0
      for (const x of list) {
        if (!x?.id || !/^\d{4}-\d{2}-\d{2}$/.test(x.date)) continue
        if (have[x.id] && have[x.id].updatedAt >= (x.updatedAt || 0)) continue
        const photos = []
        for (const p of Array.isArray(x.photos) ? x.photos.slice(0, MAX_PHOTOS) : []) {
          if (typeof p?.data !== 'string' || !p.data.startsWith('data:image/')) continue
          try { photos.push({ id: String(p.id || Math.random()), w: +p.w || 0, h: +p.h || 0, blob: await dataUrlToBlob(p.data) }) } catch {}
        }
        await putEntry({
          id: String(x.id), date: x.date, title: String(x.title || ''), body: String(x.body || ''),
          mood: moods.includes(x.mood) ? x.mood : '', weather: weathers.includes(x.weather) ? x.weather : '', photos, tags: Array.isArray(x.tags) ? x.tags.map(String) : [],
          createdAt: x.createdAt || Date.now(), updatedAt: x.updatedAt || Date.now(),
        })
        n++
      }
      // 달력 꾸미기: 같은 날짜는 더 최근에 고친 쪽을 남긴다
      const stickers = STICKERS.map((s) => s.k)
      const colors = HIGHLIGHTS.map((h) => h.k)
      for (const x of Array.isArray(data.days) ? data.days : []) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(x?.date)) continue
        if (days[x.date] && days[x.date].updatedAt >= (x.updatedAt || 0)) continue
        const d = {
          date: x.date, sticker: stickers.includes(x.sticker) ? x.sticker : '', color: colors.includes(x.color) ? x.color : '',
          memo: String(x.memo || '').slice(0, 6), updatedAt: x.updatedAt || Date.now(),
        }
        if (d.sticker || d.color || d.memo) await putDay(d)
      }
      await reload()
      toast(`${n}개를 가져왔어요`)
    } catch {
      toast('백업 파일을 읽지 못했어요')
    }
  }

  const wipe = async () => {
    if (!entries.length && !Object.keys(days).length) return toast('지울 일기가 없어요')
    if (!confirm(`일기 ${entries.length}개와 달력 꾸미기를 모두 지울까요? 먼저 백업했는지 확인하세요.`)) return
    if (prompt('확인을 위해 "삭제" 라고 입력하세요') !== '삭제') return toast('취소했어요')
    await clearAll()
    await reload()
    toast('모두 지웠어요')
  }

  return (
    <>
      <h1 className="page-title">설정</h1>
      <p className="page-sub">화면과 백업을 관리해요</p>

      <section className="section">
        <h3><Palette size={18} /> 화면 테마</h3>
        <p>시스템을 고르면 폰의 다크 모드 설정을 따라가요.</p>
        <div className="seg" role="radiogroup" aria-label="화면 테마">
          {THEMES.map(({ id, label, Icon }) => (
            <button key={id} role="radio" aria-checked={theme === id} className={theme === id ? 'on' : ''} onClick={() => setTheme(id)}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h3><Download size={18} /> 백업</h3>
        <p>일기와 사진은 이 폰 안에만 저장돼요. 한 달에 한 번은 파일로 내보내 드라이브에 보관하세요.</p>
        <div className="row">
          <button className="btn primary" onClick={exportJson}><Download size={17} /> 내보내기</button>
          <button className="btn" onClick={() => fileRef.current.click()}><Upload size={17} /> 가져오기</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
        </div>
      </section>

      <section className="section">
        <h3><HardDrive size={18} /> 저장 상태</h3>
        <p>
          일기 {entries.length}개 저장됨.{' '}
          {persisted === true && '영구 저장이 켜져 있어 브라우저가 임의로 지우지 않아요.'}
          {persisted === false && '영구 저장이 아직 꺼져 있어요. 홈 화면에 설치하면 보통 켜져요.'}
        </p>
      </section>

      <section className="section risky">
        <h3><Trash2 size={18} /> 전체 삭제</h3>
        <p>모든 일기와 달력 꾸미기를 지웁니다. 되돌릴 수 없어요.</p>
        <button className="btn danger" onClick={wipe}><Trash2 size={17} /> 모두 지우기</button>
      </section>
    </>
  )
}
