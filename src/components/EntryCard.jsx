import { WD, parse } from '../utils'
import { Face, Sky } from './Doodles'
import { Thumb } from './Photos'

export default function EntryCard({ entry, onOpen }) {
  const d = parse(entry.date)
  const lines = (entry.body || '').trim().split('\n')
  const title = entry.title || lines[0] || '(빈 일기)'
  const snippet = entry.title ? entry.body : lines.slice(1).join('\n')

  return (
    <button className="entry" onClick={() => onOpen(entry)}>
      <div className={`entry-date ${d.getDay() === 0 ? 'sun' : d.getDay() === 6 ? 'sat' : ''}`}>
        <b>{d.getDate()}</b>
        <small>{WD[d.getDay()]}</small>
      </div>
      <div className="entry-main">
        <div className="entry-title">{title}</div>
        {snippet?.trim() && <p className="entry-snip">{snippet.trim()}</p>}
        {entry.tags?.length > 0 && (
          <div className="tags">
            {entry.tags.map((t) => <span key={t} className="tag">#{t}</span>)}
          </div>
        )}
      </div>
      {(entry.weather || entry.mood || entry.photos?.length > 0) && (
        <span className="entry-side">
          {(entry.weather || entry.mood) && <span className="entry-mood" aria-label="날씨와 기분"><Sky e={entry.weather} size={22} /><Face e={entry.mood} size={24} /></span>}
          {entry.photos?.length > 0 && <Thumb photo={entry.photos[0]} />}
        </span>
      )}
    </button>
  )
}
