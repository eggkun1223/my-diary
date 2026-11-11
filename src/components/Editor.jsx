import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Camera, Check, ChevronDown, Hash, Trash2, X } from 'lucide-react'
import { MOODS, WEATHERS, WD, parse, uid, ymd } from '../utils'
import { Face, Sky } from './Doodles'
import { Lightbox, MAX_PHOTOS, Polaroid, shrinkPhoto } from './Photos'

const cleanTag = (t) => t.trim().replace(/^#+/, '').trim()

export default function Editor({ entry, initialDate, dirtyRef, onSave, onDelete, onClose, toast }) {
  const [date, setDate] = useState(initialDate)
  const [mood, setMood] = useState(entry?.mood || '')
  const [weather, setWeather] = useState(entry?.weather || '')
  const [title, setTitle] = useState(entry?.title || '')
  const [body, setBody] = useState(entry?.body || '')
  const [tags, setTags] = useState(entry?.tags || [])
  const [tagText, setTagText] = useState('')
  const [photos, setPhotos] = useState(entry?.photos || [])
  const [shrinking, setShrinking] = useState(0) // 줄이는 중인 사진 수
  const [shown, setShown] = useState(-1) // 크게 보는 사진 순번
  const closeShown = useCallback(() => setShown(-1), [])
  const bodyRef = useRef()
  const photoRef = useRef()

  const addPhotos = async (ev) => {
    const files = [...ev.target.files]
    ev.target.value = ''
    const room = MAX_PHOTOS - photos.length
    if (!files.length || room <= 0) return
    if (files.length > room) toast(`사진은 ${MAX_PHOTOS}장까지 넣을 수 있어요`)
    const pick = files.slice(0, room)
    setShrinking(pick.length)
    let failed = 0
    for (const f of pick) {
      try {
        const p = await shrinkPhoto(f, uid())
        setPhotos((prev) => (prev.length < MAX_PHOTOS ? [...prev, p] : prev))
      } catch {
        failed++
      }
      setShrinking((n) => n - 1)
    }
    if (failed) toast(`사진 ${failed}장을 열지 못했어요. JPG·PNG 사진인지 확인해 주세요`)
  }

  useEffect(() => {
    if (!entry) bodyRef.current?.focus()
  }, [entry])

  // 저장 안 한 변경이 있는지 App 에 알려 준다 (뒤로가기 확인용)
  useEffect(() => {
    dirtyRef.current =
      title !== (entry?.title || '') || body !== (entry?.body || '') || mood !== (entry?.mood || '') || weather !== (entry?.weather || '') ||
      tags.join('\u0000') !== (entry?.tags || []).join('\u0000') || date !== initialDate || cleanTag(tagText) !== '' ||
      photos.map((p) => p.id).join() !== (entry?.photos || []).map((p) => p.id).join()
  })

  // 본문 길이에 맞춰 높이를 늘린다
  useLayoutEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px' // 최소 높이는 CSS 가 정한다
  }, [body])

  const addTag = (raw) => {
    const t = cleanTag(raw)
    if (t) setTags((prev) => (prev.includes(t) ? prev : [...prev, t]))
    setTagText('')
  }
  const onTagKey = (e) => {
    if (e.nativeEvent.isComposing) return // 한글 조합 중 Enter 는 무시
    if (e.key === 'Enter') { e.preventDefault(); addTag(tagText) }
    else if (e.key === 'Backspace' && !tagText && tags.length) setTags(tags.slice(0, -1))
  }
  const onTagChange = (e) => {
    // 쉼표가 들어오면 그 앞부분을 태그로 만든다 (붙여넣기처럼 한 번에 여러 개가 와도)
    const parts = e.target.value.split(/[,，]/)
    const rest = parts.pop()
    const add = parts.map(cleanTag).filter(Boolean)
    if (add.length) setTags((prev) => [...new Set([...prev, ...add])])
    setTagText(rest)
  }

  const save = () => {
    if (shrinking) return toast('사진을 넣는 중이에요. 잠시만요')
    if (!title.trim() && !body.trim() && !photos.length) return toast('내용을 써 주세요')
    const pending = cleanTag(tagText)
    const now = Date.now()
    onSave({
      id: entry?.id || uid(),
      createdAt: entry?.createdAt || now,
      updatedAt: now,
      date: date || ymd(new Date()),
      title: title.trim(),
      body: body.trimEnd(),
      mood,
      weather,
      photos,
      tags: [...new Set(pending ? [...tags, pending] : tags)],
    })
  }

  const del = () => {
    if (confirm('이 일기를 지울까요? 되돌릴 수 없어요.')) onDelete(entry.id)
  }

  const d = parse(date || ymd(new Date()))

  return (
    <div className="editor" role="dialog" aria-modal="true" aria-label={entry ? '일기 고치기' : '새 일기'}>
      <div className="ed-bar">
        <button className="icon-btn" onClick={onClose} aria-label="닫기"><X size={22} /></button>
        <div className="grow" />
        {entry && <button className="icon-btn danger" onClick={del} aria-label="삭제"><Trash2 size={20} /></button>}
        <button className="btn primary" onClick={save}><Check size={18} strokeWidth={2.6} /> 저장</button>
      </div>

      <div className="ed-scroll">
        <div className="ed-body">
          <div className="page">
            <div className="page-head">
              <label className="ph-date">
                <span>{d.getFullYear()}년 {d.getMonth() + 1}월 {d.getDate()}일</span>
                <span className="wd">{WD[d.getDay()]}요일</span>
                <ChevronDown size={18} />
                <input
                  type="date" value={date} aria-label="날짜 바꾸기"
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  onClick={(e) => { try { e.currentTarget.showPicker?.() } catch {} }}
                />
              </label>
              <div className="ph-row" role="radiogroup" aria-label="오늘의 날씨">
                <span className="ph-label">날씨</span>
                {WEATHERS.map((w) => (
                  <button key={w.e} role="radio" aria-checked={weather === w.e} aria-label={w.label} title={w.label} className={weather === w.e ? 'pick on' : 'pick'} onClick={() => setWeather(weather === w.e ? '' : w.e)}>
                    <Sky e={w.e} size={26} />
                  </button>
                ))}
              </div>
              <div className="ph-row" role="radiogroup" aria-label="오늘의 기분">
                <span className="ph-label">기분</span>
                {MOODS.map((m) => (
                  <button key={m.e} role="radio" aria-checked={mood === m.e} aria-label={m.label} title={m.label} className={mood === m.e ? 'pick on' : 'pick'} onClick={() => setMood(mood === m.e ? '' : m.e)}>
                    <Face e={m.e} size={26} />
                  </button>
                ))}
              </div>
            </div>
            <div className={`photo-strip ${photos.length + shrinking === 1 ? 'one' : ''}`}>
              {photos.map((p, n) => (
                <Polaroid key={p.id} photo={p} onOpen={() => setShown(n)} label={`${n + 1}번째 사진 크게 보기`}
                  onRemove={() => setPhotos(photos.filter((x) => x.id !== p.id))} />
              ))}
              {Array.from({ length: shrinking }, (_, i) => <figure key={'s' + i} className="polaroid loading"><span className="polaroid-img"><span className="polaroid-blank" /></span></figure>)}
              {photos.length + shrinking < MAX_PHOTOS && (
                <button className={`photo-add ${photos.length + shrinking <= 1 ? 'wide' : ''}`} onClick={() => photoRef.current.click()}>
                  <Camera size={20} />
                  <span>사진 넣기</span>
                  <small>{photos.length + shrinking}/{MAX_PHOTOS}</small>
                </button>
              )}
              <input ref={photoRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
            </div>
            <div className="page-sheet">
              <input className="ed-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" aria-label="제목" />
              <textarea ref={bodyRef} className="ed-text" value={body} onChange={(e) => setBody(e.target.value)} placeholder="오늘은 어떤 하루였나요?" aria-label="일기 내용" />
            </div>
          </div>

          <div className="tag-field">
            <Hash size={16} />
            {tags.map((t) => (
              <button key={t} className="chip" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`${t} 태그 빼기`}>
                {t} <X size={12} strokeWidth={2.6} />
              </button>
            ))}
            <input
              value={tagText} onChange={onTagChange} onKeyDown={onTagKey} onBlur={() => cleanTag(tagText) && addTag(tagText)}
              placeholder={tags.length ? '' : '태그 추가 (Enter 또는 쉼표)'} aria-label="태그 추가"
            />
          </div>
        </div>
      </div>
      {shown >= 0 && photos[shown] && <Lightbox photos={photos} index={shown} onIndex={setShown} onClose={closeShown} />}
    </div>
  )
}
