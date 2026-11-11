import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { MOODS, WEATHERS, WD, parse, sortEntries } from '../utils'
import { Face, Sky } from './Doodles'
import { Lightbox, Polaroid } from './Photos'

const labelOf = (list, e) => list.find((x) => x.e === e)?.label || ''

// 일기 한 편을 일기장 한 쪽처럼 펼쳐 보여 준다. 고치려면 「고치기」를 누른다.
export default function Reader({ entry, entries, onEdit, onMove, onClose }) {
  const d = parse(entry.date)
  const sorted = sortEntries(entries) // 최신이 앞
  const i = sorted.findIndex((e) => e.id === entry.id)
  const newer = sorted[i - 1]
  const older = sorted[i + 1]
  const photos = entry.photos || []
  const [shown, setShown] = useState(-1) // 크게 보는 사진 순번
  const closeShown = useCallback(() => setShown(-1), [])

  return (
    <div className="editor reader" role="dialog" aria-modal="true" aria-label="일기 읽기">
      <div className="ed-bar">
        <button className="icon-btn" onClick={onClose} aria-label="목록으로"><ChevronLeft size={24} /></button>
        <div className="grow" />
        <button className="btn" onClick={() => onEdit(entry)}><Pencil size={16} /> 고치기</button>
      </div>

      <div className="ed-scroll">
        <div className="ed-body">
          <article className="page">
            <header className="page-head">
              <div className="ph-date">
                <span>{d.getFullYear()}년 {d.getMonth() + 1}월 {d.getDate()}일</span>
                <span className="wd">{WD[d.getDay()]}요일</span>
              </div>
              <div className="ph-pair">
                <div className="ph-cell">
                  <span className="ph-label">날씨</span>
                  {entry.weather ? <><Sky e={entry.weather} size={24} />{labelOf(WEATHERS, entry.weather)}</> : <span className="ph-none">안 적음</span>}
                </div>
                <div className="ph-cell">
                  <span className="ph-label">기분</span>
                  {entry.mood ? <><Face e={entry.mood} size={24} />{labelOf(MOODS, entry.mood)}</> : <span className="ph-none">안 적음</span>}
                </div>
              </div>
            </header>
            {photos.length > 0 && (
              <div className={`photo-strip ${photos.length === 1 ? 'one' : ''}`}>
                {photos.map((p, n) => <Polaroid key={p.id} photo={p} onOpen={() => setShown(n)} label={`${n + 1}번째 사진 크게 보기`} />)}
              </div>
            )}
            <div className="page-sheet">
              {entry.title && <h2 className="ed-title rd-title">{entry.title}</h2>}
              <div className="ed-text rd-text">{entry.body}</div>
            </div>
          </article>

          {entry.tags?.length > 0 && (
            <div className="tags rd-tags">
              {entry.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
            </div>
          )}

          <nav className="rd-nav" aria-label="다른 날 일기">
            <button disabled={!older} onClick={() => onMove(older)}><ChevronLeft size={18} /> 이전 일기</button>
            <button disabled={!newer} onClick={() => onMove(newer)}>다음 일기 <ChevronRight size={18} /></button>
          </nav>
        </div>
      </div>
      {shown >= 0 && <Lightbox photos={photos} index={shown} onIndex={setShown} onClose={closeShown} />}
    </div>
  )
}
