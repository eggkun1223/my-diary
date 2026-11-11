// 손으로 그린 듯한 스티커 그림. 저장된 값은 이모지 그대로 두고, 화면에 보일 때만 그림으로 바꾼다.
const INK = 'var(--st-ink)'
const line = { fill: 'none', stroke: INK, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
const BLOB = 'M12 2.6c5.300-.2 9.500 3.900 9.400 9.300-.1 5.300-4.100 9.500-9.500 9.500-5.200 0-9.400-4-9.300-9.400C2.700 6.800 6.800 2.800 12 2.600z'
const CLOUD = 'M7 18.500c-2.500 0-4.300-1.700-4.300-3.900 0-2 1.500-3.600 3.500-3.900.5-2.700 2.800-4.700 5.600-4.700 2.700 0 4.900 1.800 5.500 4.300 2.200.1 3.900 1.900 3.900 4.100 0 2.300-1.800 4.100-4.100 4.100H7z'

const Svg = ({ size, children, box = '0 0 24 24', ...rest }) => (
  <svg className="doodle" width={size} height={size} viewBox={box} aria-hidden="true" {...rest}>{children}</svg>
)
const Eyes = ({ y = 10.5 }) => (
  <>
    <circle cx="9" cy={y} r="1" fill={INK} />
    <circle cx="15" cy={y} r="1" fill={INK} />
  </>
)
const Cheeks = () => (
  <>
    <circle cx="6.300" cy="13.600" r="1.4" fill="var(--st-blush)" opacity="0.7" />
    <circle cx="17.700" cy="13.600" r="1.4" fill="var(--st-blush)" opacity="0.7" />
  </>
)

const FACES = {
  '😄': ['var(--st-butter)', (
    <>
      <path d="M7.500 10.800c.5-1 1.600-1 2.100 0M14.400 10.800c.5-1 1.600-1 2.100 0" {...line} />
      <path d="M8.300 13.500c1 3 6.400 3 7.400 0z" {...line} fill="#fff" />
      <Cheeks />
    </>
  )],
  '🙂': ['var(--st-sky)', (
    <>
      <Eyes />
      <path d="M8.800 14c1.700 1.800 4.700 1.800 6.400 0" {...line} />
      <Cheeks />
    </>
  )],
  '😐': ['var(--st-gray)', (
    <>
      <Eyes />
      <path d="M9.300 14.700h5.400" {...line} />
    </>
  )],
  '😢': ['var(--st-blue)', (
    <>
      <path d="M7.600 8.800l2.200-.7M16.400 8.800l-2.200-.7" {...line} />
      <Eyes y={11} />
      <path d="M9 16c1.500-1.500 4.500-1.500 6 0" {...line} />
      <path d="M16.800 12.800c.8 1.100 1.200 1.800 1.200 2.400a1.200 1.200 0 0 1-2.400 0c0-.6.4-1.300 1.200-2.400z" fill="var(--st-drop)" stroke={INK} strokeWidth="1" strokeLinejoin="round" />
    </>
  )],
  '😡': ['var(--st-pink)', (
    <>
      <path d="M7.200 8.700l3 1.300M16.800 8.700l-3 1.300" {...line} />
      <Eyes y={11.500} />
      <path d="M9.200 16c1.400-1.300 4.200-1.300 5.600 0" {...line} />
    </>
  )],
}

export function Face({ e, size = 24 }) {
  const f = FACES[e]
  if (!f) return e ? <span>{e}</span> : null
  return (
    <Svg size={size}>
      <path d={BLOB} fill={f[0]} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      {f[1]}
    </Svg>
  )
}

const Sun = ({ cx, cy, r }) => {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
    const t = (a * Math.PI) / 180
    const p = (d) => `${(cx + Math.cos(t) * d).toFixed(1)} ${(cy + Math.sin(t) * d).toFixed(1)}`
    return `M${p(r + 2)}L${p(r + 4.200)}`
  }).join('')
  return (
    <>
      <path d={rays} {...line} stroke="var(--st-ray)" />
      <circle cx={cx} cy={cy} r={r} fill="var(--st-butter)" stroke={INK} strokeWidth="1.5" />
    </>
  )
}
const Cloud = ({ fill = '#fff', ...rest }) => <path d={CLOUD} fill={fill} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" {...rest} />
const drop = { fill: 'none', stroke: 'var(--st-drop)', strokeWidth: 1.8, strokeLinecap: 'round' }

const SKIES = {
  '☀️': <Sun cx={12} cy={12} r={4.600} />,
  '⛅': (
    <>
      <Sun cx={16.200} cy={8.200} r={3.200} />
      <Cloud transform="translate(-1.200 3) scale(0.9)" />
    </>
  ),
  '☁️': <Cloud fill="var(--st-gray)" />,
  '🌧️': (
    <>
      <Cloud fill="var(--st-sky)" transform="translate(0 -3.500)" />
      <path d="M8.200 17.800l-1 2.600M12.400 17.800l-1 2.600M16.600 17.800l-1 2.600" {...drop} />
    </>
  ),
  '❄️': (
    <>
      <Cloud transform="translate(0 -3.500)" />
      <path d="M7.500 19h.01M12 20.600h.01M16.500 19h.01M9.800 21.800h.01M14.300 18.200h.01" {...drop} strokeWidth="2.200" />
    </>
  ),
}

export function Sky({ e, size = 24 }) {
  const s = SKIES[e]
  if (!s) return e ? <span>{e}</span> : null
  return <Svg size={size}>{s}</Svg>
}

// 해를 등진 웃는 구름 — 머리말과 빈 화면에 쓴다
export function SmileCloud({ size = 72, className = '' }) {
  return (
    <svg className={`doodle ${className}`} width={size} height={size * 0.82} viewBox="0 0 48 39.500" aria-hidden="true">
      <Sun cx={35} cy={11} r={6} />
      <g transform="translate(-1 -1.500) scale(2)">
        <path d={CLOUD} fill="#fff" stroke={INK} strokeWidth="0.85" strokeLinejoin="round" />
      </g>
      <circle cx="19" cy="25" r="1.4" fill={INK} />
      <circle cx="28" cy="25" r="1.4" fill={INK} />
      <path d="M20.800 29c1.500 1.500 3.900 1.500 5.400 0" {...line} strokeWidth="1.600" />
      <circle cx="15" cy="28.600" r="2.100" fill="var(--st-blush)" opacity="0.7" />
      <circle cx="32" cy="28.600" r="2.100" fill="var(--st-blush)" opacity="0.7" />
    </svg>
  )
}

const fillLine = (fill) => ({ fill, stroke: INK, strokeWidth: 1.5, strokeLinejoin: 'round', strokeLinecap: 'round' })
const PETALS = [0, 72, 144, 216, 288].map((a) => {
  const t = ((a - 90) * Math.PI) / 180
  return [(12 + Math.cos(t) * 5.200).toFixed(1), (12 + Math.sin(t) * 5.200).toFixed(1)]
})

const STICKER_ART = {
  heart: <path d="M12 20.300c-4.600-3.300-8-6.300-8-10.100 0-2.600 2-4.500 4.400-4.500 1.500 0 2.800.7 3.600 1.900.8-1.200 2.100-1.900 3.600-1.900 2.400 0 4.400 1.900 4.400 4.500 0 3.800-3.400 6.800-8 10.100z" {...fillLine('var(--st-blush)')} />,
  star: <path d="M12 3.200l2.600 5.600 6.100.7-4.500 4.200 1.200 6-5.400-3-5.400 3 1.200-6-4.500-4.200 6.100-.7z" {...fillLine('var(--st-butter)')} />,
  flower: (
    <>
      {PETALS.map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="3.300" {...fillLine('var(--st-pink)')} />)}
      <circle cx="12" cy="12" r="2.600" {...fillLine('var(--st-butter)')} />
    </>
  ),
  cake: (
    <>
      <path d="M12 11V7.500" {...line} />
      <circle cx="12" cy="5.600" r="1.400" {...fillLine('var(--st-butter)')} strokeWidth="1.200" />
      <path d="M4.500 11.500h15v8.500h-15z" {...fillLine('var(--st-pink)')} />
      <path d="M4.500 14.500c1.300 1.600 2.500 1.600 3.800 0 1.200 1.600 2.500 1.600 3.700 0 1.200 1.600 2.500 1.600 3.700 0 1.300 1.600 2.500 1.600 3.800 0" {...line} stroke="#fff" strokeWidth="1.800" />
      <path d="M4.500 11.500h15v8.500h-15z" {...line} />
    </>
  ),
  gift: (
    <>
      <path d="M5 11h14v9H5z" {...fillLine('var(--st-sky)')} />
      <path d="M3.800 7.500h16.400V11H3.800z" {...fillLine('var(--st-butter)')} />
      <path d="M12 7.500V20M12 7.500c-1.800-3.800-5.800-2.300-3.600 0M12 7.500c1.800-3.800 5.800-2.300 3.600 0" {...line} />
    </>
  ),
  plane: (
    <>
      <path d="M3.300 11.200L20.700 4l-5.600 16.500-3.600-6.400z" {...fillLine('var(--st-sky)')} />
      <path d="M11.500 14.100L20.700 4" {...line} />
    </>
  ),
  note: (
    <>
      <path d="M9.200 17.200V6.500l9-2.200v10.900" {...line} />
      <circle cx="7" cy="17.200" r="2.300" {...fillLine('var(--st-blue)')} />
      <circle cx="16" cy="15.200" r="2.300" {...fillLine('var(--st-blue)')} />
    </>
  ),
  cup: (
    <>
      <path d="M8.500 3.500c-.9 1.100.9 2.100 0 3.200M12 3.500c-.9 1.100.9 2.100 0 3.200" {...line} stroke="var(--st-ray)" />
      <path d="M16 11.200h1.300a2.300 2.300 0 0 1 0 4.600H16" {...line} stroke="var(--st-ray)" />
      <path d="M5 9.500h11V15a4.500 4.500 0 0 1-4.500 4.500h-2A4.500 4.500 0 0 1 5 15z" {...fillLine('#fff')} />
    </>
  ),
}

export function Sticker({ k, size = 24 }) {
  const art = STICKER_ART[k]
  return art ? <Svg size={size}>{art}</Svg> : null
}
