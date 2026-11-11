import { useMemo, useState } from 'react'
import { Camera, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import { HIGHLIGHTS, STICKERS, WD, pad, parse, ymd, streak } from '../utils'
import EntryCard from './EntryCard'
import { Face, Sticker } from './Doodles'

export default function CalendarView({ entries, days, onDecorate, selDay, setSelDay, onOpen }) {
  const [cursor, setCursor] = useState(() => {
    const d = parse(selDay)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [decorating, setDecorating] = useState(false)
  const y = cursor.getFullYear()
  const m = cursor.getMonth()
  const today = ymd(new Date())

  const byDay = useMemo(() => {
    const map = {}
    for (const e of entries) (map[e.date] ||= []).push(e)
    for (const k in map) map[k].sort((a, b) => b.updatedAt - a.updatedAt)
    return map
  }, [entries])

  const firstWd = new Date(y, m, 1).getDay()
  const lastDay = new Date(y, m + 1, 0).getDate()
  const cells = Array.from({ length: lastDay }, (_, i) => `${y}-${pad(m + 1)}-${pad(i + 1)}`)
  const monthCount = cells.filter((k) => byDay[k]).length
  const sel = parse(selDay)
  const selEntries = byDay[selDay] || []
  const deco = days[selDay] || {}
  const decorated = !!(deco.sticker || deco.color || deco.memo)
  const move = (n) => setCursor(new Date(y, m + n, 1))
  const selLabel = `${sel.getMonth() + 1}월 ${sel.getDate()}일`

  return (
    <>
      <h1 className="page-title">달력</h1>
      <p className="page-sub">날짜를 누르고 「꾸미기」로 스티커와 형광펜을 더해요</p>

      <div className="cal">
        <div className="cal-head">
          <button className="icon-btn" onClick={() => move(-1)} aria-label="이전 달"><ChevronLeft size={22} /></button>
          <b>{y}년 {m + 1}월</b>
          <button className="icon-btn" onClick={() => move(1)} aria-label="다음 달"><ChevronRight size={22} /></button>
        </div>
        <div className="cal-grid">
          {WD.map((w, i) => (
            <div key={w} className={`cal-wd ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}`}>{w}</div>
          ))}
          {Array.from({ length: firstWd }, (_, i) => <div key={'b' + i} className="day blank" />)}
          {cells.map((k, i) => {
            const es = byDay[k]
            const dc = days[k]
            const cls = ['day', es && 'has', k === today && 'today', k === selDay && 'sel'].filter(Boolean).join(' ')
            const pics = es?.some((e) => e.photos?.length > 0)
            const label = `${m + 1}월 ${i + 1}일${es ? ', 기록 있음' : ''}${pics ? ', 사진 있음' : ''}${dc?.memo ? `, ${dc.memo}` : ''}`
            return (
              <button key={k} className={cls} data-hl={dc?.color || undefined} onClick={() => setSelDay(k)} aria-label={label}>
                {i + 1}
                {pics && <span className="day-photo"><Camera size={10} strokeWidth={2.6} /></span>}
                {dc?.sticker && <span className="day-sticker"><Sticker k={dc.sticker} size={19} /></span>}
                {dc?.memo && <span className="day-memo">{dc.memo}</span>}
                {es?.[0].mood && <span className="day-mood"><Face e={es[0].mood} size={18} /></span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="stats">
        <div className="stat"><b>{monthCount}</b><small>이번 달 기록</small></div>
        <div className="stat hot"><b>{streak(entries)}</b><small>연속 기록일</small></div>
        <div className="stat"><b>{entries.length}</b><small>전체 일기</small></div>
      </div>

      <div className="month-label">
        <span className="tape">{selLabel} {WD[sel.getDay()]}요일</span>
        <button className={`deco-toggle ${decorating ? 'on' : ''}`} onClick={() => setDecorating(!decorating)} aria-expanded={decorating}>
          {decorating ? <X size={15} /> : <Sparkles size={15} />} {decorating ? '닫기' : '꾸미기'}
        </button>
      </div>

      {decorating && (
        <section className="deco" aria-label={`${selLabel} 꾸미기`}>
          <div className="deco-row">
            <span className="ph-label">스티커</span>
            <div className="deco-picks" role="radiogroup" aria-label="스티커">
              {STICKERS.map((s) => (
                <button key={s.k} role="radio" aria-checked={deco.sticker === s.k} aria-label={s.label} title={s.label}
                  className={deco.sticker === s.k ? 'sticker-pick on' : 'sticker-pick'}
                  onClick={() => onDecorate(selDay, { sticker: deco.sticker === s.k ? '' : s.k })}>
                  <Sticker k={s.k} size={26} />
                </button>
              ))}
            </div>
          </div>
          <div className="deco-row">
            <span className="ph-label">형광펜</span>
            <div className="deco-picks" role="radiogroup" aria-label="형광펜 색">
              {HIGHLIGHTS.map((h) => (
                <button key={h.k} role="radio" aria-checked={deco.color === h.k} aria-label={h.label} title={h.label}
                  className={deco.color === h.k ? 'hl-pick on' : 'hl-pick'} data-hl={h.k}
                  onClick={() => onDecorate(selDay, { color: deco.color === h.k ? '' : h.k })} />
              ))}
            </div>
          </div>
          <div className="deco-row">
            <label className="ph-label" htmlFor="deco-memo">메모</label>
            <input id="deco-memo" className="deco-memo" value={deco.memo || ''} maxLength={6} placeholder="생일, 월급날처럼 6자까지"
              onChange={(e) => onDecorate(selDay, { memo: e.target.value })} />
          </div>
          {decorated && (
            <button className="deco-clear" onClick={() => onDecorate(selDay, { sticker: '', color: '', memo: '' })}>이 날 꾸미기 지우기</button>
          )}
        </section>
      )}

      {selEntries.length
        ? selEntries.map((e) => <EntryCard key={e.id} entry={e} onOpen={onOpen} />)
        : <div className="empty small">이 날은 기록이 없어요. 「쓰기」로 남겨 보세요.</div>}
    </>
  )
}
