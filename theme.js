// 화면이 그려지기 전에 저장된 테마를 적용해 깜빡임을 막는다.
// 보안 설정(CSP)이 HTML 안의 스크립트를 막기 때문에 따로 파일로 둔다.
try {
  var t = localStorage.getItem('diary-theme')
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t)
} catch (e) {}
