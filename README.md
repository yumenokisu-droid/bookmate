# BOOKMATE v3.0 - Netlify + Gemini

실제 BOOKMATE 전체 프로젝트를 기준으로 Netlify Functions와 Gemini API를 연결한 버전입니다.

## GitHub에 올릴 것
- `public/`
- `netlify/`
- `package.json`
- `netlify.toml`
- `README.md`
- `.env.example`

## 올리면 안 되는 것
- `.env`
- `node_modules/`

## Netlify 설정
- Build command: `npm install`
- Publish directory: `public`
- Functions directory: `netlify/functions`

## 환경변수
Netlify > Site configuration > Environment variables 에 추가:

`GEMINI_API_KEY = 본인의 Gemini API 키`

선택:

`GEMINI_MODEL = gemini-2.5-flash`

## 참고
공유 링크는 현재 무료 서버리스 임시 저장 방식입니다. 공모전 시연용으로는 사용할 수 있지만, 영구 공유 링크가 필요하면 Supabase/Firebase 같은 DB를 추가해야 합니다.
