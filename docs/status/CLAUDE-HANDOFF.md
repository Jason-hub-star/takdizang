# Claude Handoff

Last Updated: 2026-03-16 (KST, UI 완성도 개선 + 컴포즈 에디터 크로스모드 통합)
Branch: `main`

## Current Snapshot
- UI 완성도 개선 완료: seed 데이터, 텍스트 정리, 카드 레이아웃 조정
- 컴포즈 에디터에 4가지 AI 기능 통합 완료:
  - Scene Compose (배경 합성) — 기존
  - Model Compose (모델컷 합성) — 신규
  - Remove BG (배경 제거) — 신규
  - Block Text Generator (블록별 AI 문구) — 신규
- 워크스페이스 에셋 브라우저로 프로젝트 간 이미지 공유 가능
- Playwright 시각 테스트 환경 구축 (12개 테스트, 기준선 저장)

## Recent Commits (2026-03-16)
1. `81e366d` feat(compose): 워크스페이스 에셋 브라우저 추가
2. `c5b45b8` feat(compose): 블록별 AI 문구 생성 기능 추가
3. `b953102` feat(compose): 모델컷 합성 및 배경 제거 블록 내 통합
4. `b1e5be2` docs: 컴포즈 에디터 개선 체크리스트 완료 표시

## Important Open Issues
- `GEMINI_API_KEY` leak 플래그 → 마케팅 스크립트 스모크 차단
- `KIE_API_KEY` 크레딧 부족 → 썸네일 스모크 차단
- 홈 카드 레이아웃 3열 vs 4열 → 사용자 피드백 대기

## New API Routes (2026-03-16)
- `GET /api/workspace/assets` — 워크스페이스 전체 에셋 조회
- `POST /api/projects/[id]/generate-block-text` — 블록 타입별 AI 문구 생성

## New Components (2026-03-16)
- `src/components/compose/shared/block-text-generator.tsx`
- `src/components/compose/shared/model-compose-action.tsx`
- `src/components/compose/shared/remove-bg-action.tsx`

## Recommended Next Steps
1. `GEMINI_API_KEY` 교체 → 마케팅 스크립트 + 블록 텍스트 생성 E2E 확인
2. `KIE_API_KEY` 충전 → 모델컷/누끼/썸네일 E2E 확인
3. 카드 레이아웃 피드백 반영
4. 컴포즈 추가 기능: 상품 URL 자동 채움, 버전 히스토리

## Validation Commands
- `npm run build`
- `npm run typecheck`
- `npm test`
- `npx playwright test`
