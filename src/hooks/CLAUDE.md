# hooks/
클라이언트 사이드 React 커스텀 훅.

## Files
- `use-async-job.ts` — 202+jobId 비동기 API 폴링 제네릭 훅
- `use-logger.ts` — BottomLogger용 로그 상태 관리 훅

## Convention
- 모든 파일 `"use client"` 지시어 필수
- 파일 첫줄에 JSDoc 설명 주석 (`/** ... */`)
- 훅 이름은 `use-*` 케밥케이스, 함수 이름은 `use*` 카멜케이스
