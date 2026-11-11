import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

// 사진은 { id, blob, w, h } 로 일기 안에 함께 저장한다.
export const MAX_PHOTOS = 4
const LONG_EDGE = 1600 // 긴 쪽을 이 길이로 줄여 저장한다 (한 장 약 300~500KB)

// 고른 사진을 줄여 JPEG 로 다시 만든다. 사진의 회전 정보(EXIF)는 브라우저가 반영한다.
export async function shrinkPhoto(file, id) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, LONG_EDGE / Math.max(bmp.width, bmp.height))
  const w = Math.round(bmp.width * scale)
  const h = Math.round(bmp.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // 투명한 PNG 도 흰 바탕으로
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bmp, 0, 0, w, h)
  bmp.close?.()
  const blob = await new Promise((ok, no) => canvas.toBlob((b) => (b ? ok(b) : no(new Error('encode'))), 'image/jpeg', 0.85))
  return { id, blob, w, h }
}

// 백업 파일에는 사진을 글자(data URL)로 바꿔 담는다
export const blobToDataUrl = (blob) =>
  new Promise((ok, no) => {
    const r = new FileReader()
    r.onload = () => ok(r.result)
    r.onerror = () => no(r.error)
    r.readAsDataURL(blob)
  })
export const dataUrlToBlob = async (url) => (await fetch(url)).blob()

// 화면에 보일 동안만 사진 주소를 만들고, 사라지면 정리한다
export function usePhotoUrl(blob) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    if (!(blob instanceof Blob)) return setUrl('')
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

export function Polaroid({ photo, onOpen, onRemove, label }) {
  const url = usePhotoUrl(photo.blob)
  const img = url ? <img src={url} alt="" draggable="false" /> : <span className="polaroid-blank" />
  // 사진의 원래 가로세로 비율대로 틀을 만들어 잘리지 않게 한다
  const ar = photo.w > 0 && photo.h > 0 ? photo.w / photo.h : 0
  return (
    <figure className="polaroid" style={ar ? { '--ar': ar } : undefined}>
      {onOpen ? <button className="polaroid-img" onClick={onOpen} aria-label={label}>{img}</button> : <span className="polaroid-img">{img}</span>}
      {onRemove && (
        <button className="polaroid-x" onClick={onRemove} aria-label="이 사진 빼기"><X size={14} strokeWidth={2.8} /></button>
      )}
    </figure>
  )
}

export function Thumb({ photo }) {
  const url = usePhotoUrl(photo.blob)
  return <span className="entry-thumb">{url && <img src={url} alt="" />}</span>
}

// 크게 보기. 안드로이드 뒤로가기로도 닫히도록 히스토리를 하나 쌓는다
let closeOverlay = null
export function popOverlay() {
  if (!closeOverlay) return false
  const f = closeOverlay
  closeOverlay = null
  f()
  return true
}

export function Lightbox({ photos, index, onIndex, onClose }) {
  const photo = photos[index]
  const url = usePhotoUrl(photo?.blob)

  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // 열릴 때 한 번만 히스토리를 쌓는다
  useEffect(() => {
    const close = () => closeRef.current()
    history.pushState({ photo: true }, '')
    closeOverlay = close
    return () => { if (closeOverlay === close) closeOverlay = null }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') history.back()
      if (e.key === 'ArrowLeft' && index > 0) onIndex(index - 1)
      if (e.key === 'ArrowRight' && index < photos.length - 1) onIndex(index + 1)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [onIndex, index, photos.length])

  if (!photo) return null
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="사진 크게 보기" onClick={() => history.back()}>
      {url && <img src={url} alt="" />}
      <button className="lb-close" aria-label="닫기"><X size={24} /></button>
      {photos.length > 1 && (
        <div className="lb-dots" onClick={(e) => e.stopPropagation()}>
          {photos.map((p, i) => (
            <button key={p.id} className={i === index ? 'on' : ''} onClick={() => onIndex(i)} aria-label={`${i + 1}번째 사진`} />
          ))}
        </div>
      )}
    </div>
  )
}
