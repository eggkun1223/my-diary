// 아이콘 PNG 생성 (외부 라이브러리 없이). 사용: node scripts/make-icons.cjs public
const fs = require('fs'), zlib = require('zlib'), path = require('path');
const out = process.argv[2] || '.';
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (~c) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
function png(S) {
  const raw = Buffer.alloc((S * 4 + 1) * S);
  const inRR = (x, y, x0, y0, x1, y1, r) => { const cx = Math.max(x0 + r, Math.min(x, x1 - r)), cy = Math.max(y0 + r, Math.min(y, y1 - r)); return (x - cx) ** 2 + (y - cy) ** 2 <= r * r && x >= x0 && x <= x1 && y >= y0 && y <= y1; };
  for (let y = 0; y < S; y++) {
    raw[y * (S * 4 + 1)] = 0;
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S;
      // 배경: 테라코타 그라데이션 (maskable 대비 전체를 채움)
      let r = 96 - 70 * v, g = 196 - 50 * v, b = 248 - 16 * v;
      // 노트: 크림색 둥근 사각형
      if (inRR(u, v, .27, .2, .73, .8, .05)) { r = 255; g = 255; b = 255; }
      // 책등
      if (u >= .27 && u <= .34 && v >= .2 && v <= .8) { r = 224; g = 240; b = 252; }
      // 줄
      for (const ly of [.38, .48, .58]) if (Math.abs(v - ly) < .012 && u > .4 && u < .66) { r = 148; g = 205; b = 240; }
      // 하트
      const hx = (u - .53) / .07, hy = -(v - .69) / .07;
      if ((hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3 <= 0) { r = 14; g = 165; b = 233; }
      const i = y * (S * 4 + 1) + 1 + x * 4;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = 255;
    }
  }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(S, 0); ih.writeUInt32BE(S, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
for (const s of [192, 512]) fs.writeFileSync(path.join(out, `icon-${s}.png`), png(s));
console.log('icons ok');
