# Claude Handoff

Last Updated: 2026-03-16 (KST, 컴포즈 블록별 AI 생성 UX 리팩토링)
Branch: `main`

## Current Snapshot
- **Auth 시스템 구현 완료**: Supabase Auth (email + Google OAuth) + 미들웨어 세션 가드
- **RLS 전면 적용**: 9개 테이블에 workspace 기반 격리 정책
- **Schema 정비 완료**: TEXT→JSONB 변환, CHECK 제약, 복합 인덱스, updated_at 전파
- **사용량 제한 가드**: 무료 한도 초과 시 429 반환 인프라
- 24+ API route의 workspace-guard 비동기 전환 완료
- **컴포즈 블록별 AI 인라인 통합**: 16개 블록(divider/video 제외)에서 AI 문구 생성 가능, 원클릭 생성 UX
- **AI 허브 탭 제거**: 프로젝트 레벨 AI 도구(영상/썸네일/스크립트)를 툴바 드롭다운 → 모달로 이전

## Recent Changes (2026-03-16, 블록별 AI 생성 UX 리팩토링)

### Phase 1: API 프롬프트 확장
- `src/app/api/projects/[id]/generate-block-text/route.ts` — BLOCK_PROMPTS + RESPONSE_SCHEMAS에 10개 블록 타입 추가 (image-text, spec-table, cta, usage-steps, notice, price-promo, trust-badge, comparison, image-grid)

### Phase 2: 속성 패널 AI 통합
- `src/components/compose/block-properties-panel.tsx` — 9개 블록에 BlockTextGenerator 추가 + image-grid/comparison에 ImageGenerateAction 추가
- `src/components/compose/shared/image-generate-action.tsx` — `label` prop 추가

### Phase 3: AI 허브 탭 제거 + 툴바 이동
- `src/components/compose/right-panel.tsx` — 탭 UI 제거, 속성 패널만 렌더링
- `src/components/compose/compose-shell.tsx` — `activeRightTab` 제거, `aiToolType` 상태 추가
- `src/components/compose/compose-toolbar.tsx` — "AI 도구" 드롭다운 추가 (영상/썸네일/스크립트)
- `src/components/compose/ai-tool-dialog.tsx` — 신규 모달 (3개 AI 도구)
- `src/components/compose/ai-hub-panel.tsx` — 삭제 (기능 이전 완료)

### UX 개선: 원클릭 생성
- `src/components/compose/shared/block-text-generator.tsx` — 리팩토링: 1클릭 즉시 생성 → 미리보기 → 적용 (2클릭), 톤/프롬프트 설정은 "설정 열기"로 접근

## Important Open Issues
- **Supabase CLI 링크 미완료**: `npx supabase link` 시 Forbidden → DB password 재설정 필요
- **Migration 미적용**: 3개 신규 migration 파일이 로컬에만 존재 (schema_cleanup, auth_schema, rls_policies)
- `GEMINI_API_KEY` 주석 처리 상태 → 블록 텍스트 생성 실제 호출 불가
- `KIE_API_KEY` 크레딧 부족 → 이미지 생성/모델컷/썸네일 실제 호출 불가
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수 필요 (기존 publishable key와 동일)

## Recommended Next Steps
1. **Supabase Dashboard에서 DB password 재설정** → `npx supabase link` → `npx supabase db push`
2. 또는 Supabase MCP `execute_sql`로 3개 migration 직접 실행
3. Supabase Dashboard → Auth → Providers에서 Google OAuth 설정
4. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경 변수 확인
5. `GEMINI_API_KEY` 활성화 후 16개 블록 AI 문구 생성 E2E 확인
6. Phase 3 (Stripe 결제) 구현
7. Phase 6 (CI/CD) `.github/workflows/ci.yml` 추가

## Validation Commands
- `npm run typecheck` — 0 errors 확인
- `npm run build` — 빌드 성공 확인
- `npm test`
- `npx playwright test`
- Migration 적용 후: seed 재삽입 → CHECK 제약 통과 확인
