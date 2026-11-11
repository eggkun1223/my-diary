import { useMemo, useState } from 'react'
import { PenLine, Search, SearchX } from 'lucide-react'
import { WD, ymd, sortEntries } from '../utils'
import EntryCard from './EntryCard'
import { SmileCloud } from './Doodles'

export default function ListView({ entries, loaded, onOpen }) {
  const [q, setQ] = useState('')
  const today = new Date()
  const wroteToday = entries.some((e) => e.date === ymd(today))

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase()
    const list = sortEntries(entries).filter(
      (e) => !query || [e.title, e.body, ...(e.tags || [])].join(' ').toLowerCase().includes(query),
    )
    const map = new Map()
    for (const e of list) {
      const k = e.date.slice(0, 7)
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(e)
    }
    return [...map.entries()]
  }, [entries, q])

  return (
    <>
      <header className="hero">
        <SmileCloud className="hero-doodle" size={76} />
        <p className="hero-year">{today.getFullYear()}년</p>
        <h1 className="hero-date">
          {today.getMonth() + 1}월 {today.getDate()}일 <small>{WD[today.getDay()]}요일</small>
        </h1>
        <p className="hero-sub">
          {entries.length ? `지금까지 ${entries.length}개의 하루를 적었어요` : '첫 페이지를 기다리고 있어요'}
        </p>
        {loaded && !wroteToday && (
          <button className="blank-line" onClick={() => onOpen(null)}>
            <span>오늘의 일기를 써 보세요</span>
            <PenLine size={19} />
          </button>
        )}
      </header>

      {entries.length > 0 && (
        <label className="search">
          <Search size={18} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="내용이나 태그로 찾기" aria-label="일기 검색" />
        </label>
      )}

      {loaded && entries.length === 0 && (
        <div className="empty">
          <SmileCloud size={104} />
          <b>아직 일기가 없어요</b>
          오른쪽 아래 「쓰기」로 시작해 보세요
        </div>
      )}

      {entries.length > 0 && groups.length === 0 && (
        <div className="empty">
          <SearchX size={40} strokeWidth={1.6} />
          <b>찾는 일기가 없어요</b>
          「{q}」와 맞는 기록이 없어요
        </div>
      )}

      {groups.map(([month, list]) => (
        <section key={month}>
          <div className="month-label">
            <span className="tape">{month.slice(0, 4)}년 {+month.slice(5)}월</span> <span className="count">{list.length}</span>
          </div>
          {list.map((e) => <EntryCard key={e.id} entry={e} onOpen={onOpen} />)}
        </section>
      ))}
    </>
  )
}
