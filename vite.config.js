import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// 보안 설정(CSP): 앱이 이 사이트 밖으로 데이터를 보내거나 외부 스크립트를 불러오지 못하게 막는다.
// 개발 서버는 화면 자동 갱신에 HTML 안 스크립트를 쓰므로 배포용 빌드에만 넣는다.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' blob: data:", // 사진은 blob:, 백업에서 읽은 사진은 data:
  "font-src 'self'",
  "connect-src 'self' data:", // 백업 가져오기에서 사진(data:)을 파일로 바꿀 때
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

const cspMeta = {
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
}

export default defineConfig({
  base: './', // GitHub Pages 같은 하위 경로에서도 동작하도록
  plugins: [
    cspMeta,
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png'],
      manifest: {
        name: '내 일기',
        short_name: '일기',
        description: '나만 쓰는 오프라인 다이어리',
        lang: 'ko',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#1370b0',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
        // Pretendard 는 글자 범위별로 잘게 나뉘어 있어, 화면에 쓰인 조각만 받아 오프라인용으로 담아 둔다
        runtimeCaching: [{
          urlPattern: ({ request }) => request.destination === 'font',
          handler: 'CacheFirst',
          options: { cacheName: 'fonts', expiration: { maxEntries: 200 } },
        }],
      },
    }),
  ],
})
