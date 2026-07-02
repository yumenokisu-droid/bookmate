# BOOKMATE v3.0.3

실제 원본 BOOKMATE를 기준으로 정리한 Netlify + Gemini 배포용 버전입니다.

## 변경 사항
- knowledge 폴더 제거
- Netlify 배포 오류를 유발하던 특수문자 파일명 제거
- AI 메뉴를 AI 독서 파트너 구조로 정리
- 오른쪽 AI 분석 메뉴 숨김
- 채팅 하단 추천 버튼 추가
- Gemini API는 Netlify Functions(`/api/chat`)로 호출

## GitHub에 올릴 것
이 폴더 안의 내용 전체

## GitHub에 올리면 안 되는 것
- `.env`
- `node_modules/`

## Netlify 환경변수
`GEMINI_API_KEY`를 Netlify Site configuration > Environment variables에 추가하세요.
