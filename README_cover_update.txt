BOOKMATE v1.4H 표지 안정화 업데이트

핵심 변경사항
- 검증된 직접 JPG 표지 주소(COVER_MAP)를 API보다 먼저 적용합니다.
- 성공 확인된 8권은 Google/OpenLibrary 검색 없이 즉시 표지가 표시됩니다.
- 알라딘 wcover.aspx 같은 동적 표지 주소는 사용하지 않도록 정리했습니다.
- COVER_MAP에 없는 책만 기존 fallback을 사용합니다.
- 캐시 버전을 갱신하여 이전 실패 표지 캐시가 남지 않도록 했습니다.

현재 고정 표지 적용 도서
- 사피엔스
- 도둑맞은 집중력
- 달러구트 꿈 백화점
- 데미안
- 불편한 편의점
- 아몬드
- 채식주의자
- 82년생 김지영

추가 도서를 넣을 때는 js/book-api.js의 DIRECT_COVER_MAP에
https://image.aladin.co.kr/product/.../cover500/...jpg 형태의 직접 JPG 주소만 추가하세요.
