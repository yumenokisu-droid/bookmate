BOOKMATE v1.3 구조개선판

목적
- 기존 1.3 화면과 기능은 최대한 유지
- Gemini/ChatGPT가 특정 기능만 빠르게 수정할 수 있도록 JavaScript를 기능별로 분리
- 공모전용 시제품 완성도 개선 작업의 기반 마련

파일 구조
- index.html : 화면 구조
- style.css : 전체 스타일
- js/state.js : 초기 데이터, 목업 데이터, 모임/책/게시글 기본값
- js/book-api.js : Google Books/Open Library 검색, 표지 fallback, 주요 도서 고정 데이터
- js/storage.js : localStorage 저장/불러오기, 선택한 책 메타데이터 관리
- js/app.js : 화면 렌더링, 버튼 동작, 모임/토론/마이페이지 기능

주의
- index.html 하단의 스크립트 로드 순서는 반드시 유지해야 합니다.
  state.js → book-api.js → storage.js → app.js
- 책 표지 검색은 인터넷 연결이 필요합니다.
- 공모전 시연 안정화를 위해 다음 단계에서는 js/book-api.js만 집중 수정하면 됩니다.
