# Takdizang Project Status

Last Updated: 2026-03-16 (KST, 컴포즈 블록별 AI 생성 UX 리팩토링)

## Latest Update

### 컴포즈 블록별 AI 생성 UX 리팩토링 (2026-03-16)
- **블록 인라인 AI 통합**: 16개 블록(divider/video 제외)에서 AI 문구 생성 가능
  - 기존 5개(text-block, selling-point, review, faq, banner-strip) + 신규 10개(image-text, spec-table, cta, usage-steps, notice, price-promo, trust-badge, comparison, image-grid)
  - image-grid, comparison 블록에 ImageGenerateAction 추가
- **원클릭 생성 UX**: "AI로 작성" 클릭 → 즉시 생성 → 미리보기 → 적용 (기존 5단계 → 2단계)
  - 톤/프롬프트는 "설정 열기" 버튼으로 필요 시만 접근
- **AI 허브 탭 제거**: 우측 패널에서 탭 UI 제거, 속성 패널만 렌더링
- **프로젝트 레벨 AI 도구 이동**: 영상 렌더링/썸네일/마케팅 스크립트를 툴바 "AI 도구" 드롭다운 → 모달로 이전
- **ai-hub-panel.tsx 삭제**: 데드 코드 정리, ai-tool-dialog.tsx로 기능 이전

### 프로덕션 로드맵 Phase 0+1+2 (2026-03-16)
- **Phase 0 — Schema 정비**: TEXT→JSONB 변환 (content, input, output, metadata, snapshot, detail) + GIN 인덱스, CHECK 제약 (project status/mode, job status 표준화), 복합 인덱스 3개, 4개 테이블 updated_at 추가
- **Phase 1 — Auth + Middleware + RLS**: profiles/workspace_members 테이블 + 회원가입 시 자동 프로비저닝 트리거, @supabase/ssr 기반 server/browser 클라이언트, Next.js middleware (세션 갱신 + 미인증 redirect), 로그인/회원가입 페이지 (email + Google OAuth), workspace-guard async 리라이트 (24+ API route 전환), 9개 테이블 RLS 정책 (get_my_workspace_ids 헬퍼), /uploads 인증 보호, 사이드바 프로필/로그아웃
- **Phase 2 — Usage Limit**: 무료 한도 가드 (월간 이벤트 타입별 제한)
- **JSONB 호환성**: parseJsonField 유틸 + 20+ 파일의 JSON.parse/stringify 안전 전환
- **Seed 데이터 표준화**: published→exported, done→done, processing→generating, completed→done

### 컴포즈 AI 생성 허브 통합 (2026-03-16)
- **블록 텍스트 생성 UX 개선**: 톤 프리셋 5종(공식적/캐주얼/재미있게/프리미엄/친근하게) + 자유 프롬프트 + 미리보기/재생성 플로우
- **모델컷 합성 프롬프트 추가**: 에셋 선택 + 스타일/포즈 프롬프트 입력 가능
- **AI 이미지 생성 블록 통합**: hero/image-full/image-text 블록에서 프롬프트 → 이미지 생성 → 적용

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
- 컴포즈 페이지가 모든 AI 기능의 중앙 허브 역할 수행 (에디터 기능 대체)
- **블록별 인라인 AI**: 16개 블록에서 원클릭 AI 문구 생성, 속성 패널 내 통합 (Shopify/Notion 패턴)
- **프로젝트 레벨 AI 도구**: 영상 렌더링/썸네일/마케팅 스크립트는 툴바 드롭다운 → 모달
- 이미지 블록에서 직접 AI 이미지 생성 가능

## Current Snapshot
- App routes available:
  - `/` (홈 — 8개 모드 카드 + 최근 프로젝트 + 템플릿)
  - `/projects` (프로젝트 탐색기)
  - `/workspace` (워크스페이스 허브)
  - `/settings` (런타임/스토리지/운영 현황)
  - `/landing` (마케팅 랜딩)
  - project subroutes: `compose`, `editor`, `preview`, `result`
- API surface: 25개 route handlers (기존 23 + workspace/assets, generate-block-text)
- 컴포즈 블록 AI 기능: Scene Compose + Model Compose + Remove BG + Block Text Generator (15개 블록) + Image Generate + AI Tool Dialog (영상/썸네일/스크립트)
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
1. `GEMINI_API_KEY` 활성화 후 16개 블록 AI 문구 생성 E2E 확인
2. `KIE_API_KEY` 충전/교체 후 이미지 생성 + 모델컷 + 썸네일 E2E 확인
3. AI 도구 모달 (영상 렌더링/마케팅 스크립트) E2E 확인
4. 컴포즈 에디터 추가 기능 검토: 상품 URL 자동 채움, 버전 히스토리
