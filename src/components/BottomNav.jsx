import { BookOpen, CalendarDays, Settings } from 'lucide-react'

const TABS = [
  { id: 'list', label: '일기', Icon: BookOpen },
  { id: 'cal', label: '달력', Icon: CalendarDays },
  { id: 'set', label: '설정', Icon: Settings },
]

export default function BottomNav({ view, onChange }) {
  return (
    <nav className="nav" aria-label="화면 전환">
      <div className="nav-in">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className={view === id ? 'on' : ''} onClick={() => onChange(id)} aria-current={view === id ? 'page' : undefined}>
            <span className="pill"><Icon size={21} strokeWidth={view === id ? 2.4 : 2} /></span>
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
