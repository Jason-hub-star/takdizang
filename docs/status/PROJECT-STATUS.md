# Takdizang Project Status

Last Updated: 2026-03-16 (KST, UI 완성도 개선 + 컴포즈 에디터 크로스모드 통합)

## Latest Update

### UI 완성도 개선 (2026-03-16)
- DB seed 데이터 삽입: 8개 프로젝트, 10개 에셋, 3개 템플릿, 12개 사용 이벤트, 4개 잡, 3개 내보내기
- 랜딩 페이지 텍스트를 사용자 대상 소개 문구로 교체
- 사이드바 "Mac Mini + NAS" 카드 제거
- 모드 카드 여백/높이 조정 (min-h-[168px], p-6)
- 설정 페이지 SummaryCard 높이 균일화 (min-h-[140px])
- 홈 그리드 2xl:grid-cols-8 제거 → 최대 4열로 제한

### 컴포즈 에디터 개선 (2026-03-16)
- **워크스페이스 에셋 브라우저**: 다른 프로젝트 에셋을 컴포즈 블록에서 선택 가능
  - `GET /api/workspace/assets` API 추가
  - AssetGrid에 workspace scope 모드 추가
  - ImageUploadZone에 "프로젝트 파일" / "전체 에셋" 탭
- **블록별 AI 문구 생성**: text-block, selling-point, review, faq, banner-strip 5개 블록
  - `POST /api/projects/[id]/generate-block-text` API 추가
  - Gemini 블록 타입별 전용 프롬프트 + JSON 스키마 강제
- **모델컷 합성 블록 내 통합**: hero/image-full/image-text 블록에서 직접 실행
  - ModelComposeAction 컴포넌트 (비동기 폴링)
- **배경 제거 블록 내 통합**: 이미지 블록에서 원클릭 배경 제거
  - RemoveBgAction 컴포넌트

### Playwright 시각 테스트 환경 (2026-03-16)
- playwright.config.ts + e2e/visual/pages.spec.ts 추가
- desktop (1440×900), tablet (768×1024), mobile (375×812) 3개 뷰포트
- home, settings, landing, projects 4개 페이지 스크린샷 기준선 저장

### 이전 업데이트 (2026-03-15)
- Takdi-style docs operating process 도입
- Supabase 런타임 데이터 레이어 전환 완료
- Supabase Storage 업로드/아티팩트 마이그레이션 완료
- 스토리지 스모크 테스트 완료

## Current Phase
- 컴포즈 에디터가 다른 모드(누끼, 모델컷)와 연계된 AI 기능을 블록 내에서 직접 실행 가능
- 워크스페이스 에셋 공유로 프로젝트 간 이미지 재활용 가능
- DB seed 데이터로 홈/설정/프로젝트 페이지가 실제 데이터로 표시

## Current Snapshot
- App routes available:
  - `/` (홈 — 8개 모드 카드 + 최근 프로젝트 + 템플릿)
  - `/projects` (프로젝트 탐색기)
  - `/workspace` (워크스페이스 허브)
  - `/settings` (런타임/스토리지/운영 현황)
  - `/landing` (마케팅 랜딩)
  - project subroutes: `compose`, `editor`, `preview`, `result`
- API surface: 25개 route handlers (기존 23 + workspace/assets, generate-block-text)
- 컴포즈 블록 AI 기능: Scene Compose + Model Compose + Remove BG + Block Text Generator
- Playwright visual test: 12개 (4 pages × 3 viewports)

## Validation
- `npm run build`
- `npm run typecheck` — 에러 0
- `npm test` — 8파일 104테스트 통과
- `npx playwright test` — 12개 시각 테스트 통과

## Known Risks
- Kie API 크레딧 부족으로 썸네일 스모크 차단
- Gemini API 키 leak 플래그로 마케팅 스크립트 스모크 차단
- Windows/.next 캐시 불안정 → `.next` 삭제 후 재빌드로 복구

## Next Actions
1. `GEMINI_API_KEY` 교체 후 마케팅 스크립트 + 내보내기 스모크 재실행
2. `KIE_API_KEY` 충전/교체 후 썸네일 스모크 재실행
3. 카드 레이아웃 3열 vs 4열 사용자 피드백 반영
4. 컴포즈 에디터 추가 기능 검토: 상품 URL 자동 채움, 버전 히스토리
