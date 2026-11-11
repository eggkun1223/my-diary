# 내 일기 (React + Vite PWA)

폰 안에만 저장하는 개인 다이어리. 안드로이드 Chrome 에서 「앱 설치」로 홈 화면에 올려 쓴다.

## 명령

```bash
npm install        # 처음 한 번
npm run dev        # 개발 서버 (http://localhost:5173) — 서비스워커는 꺼져 있음
npm run build      # dist/ 에 배포용 결과물 생성 (서비스워커 포함)
npm run preview    # 빌드 결과를 로컬에서 확인
```

아이콘을 다시 만들 때: `node scripts/make-icons.cjs public` 후 `public/icon-192.png` 를 `favicon.png` 로 복사.

## 구조

| 파일 | 하는 일 |
|---|---|
| `src/App.jsx` | 화면 전환, 편집기 열고 닫기(안드로이드 뒤로가기), 테마 |
| `src/db.js` | IndexedDB 저장소 (일기 `entries`, 달력 꾸미기 `days`) |
| `src/utils.js` | 날짜·기분·날씨·스티커·연속 기록일 도우미 |
| `src/styles.css` | 색 토큰(라이트/다크)과 전체 스타일 |
| `src/components/` | 목록·달력·설정·편집기·읽기 화면·아래 탭 |
| `src/components/Doodles.jsx` | 손그림 표정·날씨·스티커 |
| `src/components/Photos.jsx` | 사진 줄이기(긴 쪽 1600px), 폴라로이드, 크게 보기 |
| `vite.config.js` | PWA 설정 (앱 이름, 아이콘, 오프라인 캐시) |

## 배포 (GitHub Pages)

```bash
npm run deploy     # 빌드한 dist/ 를 gh-pages 브랜치로 올린다. 1~2분 뒤 반영
```

`base: './'` 라서 `https://아이디.github.io/저장소명/` 같은 하위 경로에서도 동작한다.
저장소 설정의 Pages 출처는 `gh-pages` 브랜치 루트다. 코드(`main`)를 올리는 것과 배포는 별개라, 고친 뒤엔 둘 다 한다.

## 데이터

일기·사진·달력 꾸미기는 브라우저의 IndexedDB(`diary` DB)에 있고 저장소에는 올라가지 않는다.
앱을 지우거나 Chrome 사이트 데이터를 지우면 함께 사라지니 설정 → 백업 → 내보내기로 JSON 을 보관할 것(사진도 들어 있다).
주소(도메인)가 다르면 데이터도 따로라, 시험 주소에서 쓴 일기는 백업 → 가져오기로 옮긴다.
