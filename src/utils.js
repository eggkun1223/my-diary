export const WD = ['일', '월', '화', '수', '목', '금', '토']

export const MOODS = [
  { e: '😄', label: '최고' },
  { e: '🙂', label: '좋음' },
  { e: '😐', label: '보통' },
  { e: '😢', label: '슬픔' },
  { e: '😡', label: '화남' },
]

export const WEATHERS = [
  { e: '☀️', label: '맑음' },
  { e: '⛅', label: '구름' },
  { e: '☁️', label: '흐림' },
  { e: '🌧️', label: '비' },
  { e: '❄️', label: '눈' },
]

// 달력 꾸미기
export const STICKERS = [
  { k: 'heart', label: '하트' },
  { k: 'star', label: '별' },
  { k: 'flower', label: '꽃' },
  { k: 'cake', label: '케이크' },
  { k: 'gift', label: '선물' },
  { k: 'plane', label: '비행기' },
  { k: 'note', label: '음표' },
  { k: 'cup', label: '커피' },
]
export const HIGHLIGHTS = [
  { k: 'yellow', label: '노랑' },
  { k: 'pink', label: '분홍' },
  { k: 'sky', label: '하늘' },
  { k: 'mint', label: '민트' },
  { k: 'violet', label: '보라' },
]

export const pad = (n) => String(n).padStart(2, '0')
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export const sortEntries = (list) =>
  [...list].sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt)

// 연속 기록일: 오늘 아직 안 썼으면 어제부터 센다
export function streak(entries) {
  const days = new Set(entries.map((e) => e.date))
  const d = new Date()
  if (!days.has(ymd(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (days.has(ymd(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}
