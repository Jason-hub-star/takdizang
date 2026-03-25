# Claude Handoff

Last Updated: 2026-03-25 (KST, 디자인 토큰 리팩토링 완료)
Branch: `main`

## Current Snapshot
- **디자인 토큰 리팩토링 완료**: globals.css에 22개 CSS 변수 + 5개 블록 클래스 추가, 17개 블록 렌더러 + 40개 컴포넌트 하드코딩 제거
- **Auth 시스템 구현 완료**: Supabase Auth (email + Google OAuth) + 미들웨어 세션 가드
- **RLS 전면 적용**: 9개 테이블에 workspace 기반 격리 정책
- **Schema 정비 완료**: TEXT→JSONB 변환, CHECK 제약, 복합 인덱스, updated_at 전파
- **사용량 제한 가드**: 무료 한도 초과 시 429 반환 인프라
- 24+ API route의 workspace-guard 비동기 전환 완료
- **컴포즈 AI 통합**: BlockTextGenerator 제거 → 우측 패널 "AI 생성" 탭(AiGenerateTab)으로 단일화
- **블록 사이 삽입 프리뷰**: ghost block이 insertAt 위치에 정확히 표시
- **AI 도구 모달**: 영상 렌더링/썸네일/스크립트 → 툴바 드롭다운 → 모달
- **Editor 노드 그래프**: React Flow 기반, 6개 모드, Simple/Expert 뷰
- **Compose/Editor 독립 병렬 동작**: 같은 `project.content` 필드, mode로 포맷 분리

## Editor State
- `src/components/editor/node-editor-shell.tsx` — React Flow 노드 그래프 에디터 코어
- 6개 모드: shortform-video, model-shot, cutout, brand-image, freeform, gif-source
- Simple 뷰: 가이드 4개 모드 (Step Editor 위저드, 3그룹 분류)
- Expert 뷰: 자유 2개 모드 (freeform, gif-source)
- 파이프라인: prompt → generate-images → bgm → cuts → render → export
- 저장: `PATCH /api/projects/[id]/content` → EditorGraph (nodes/edges/shortform)

## Recent Changes (2026-03-17, Compose AI UX v4)

### Phase 1: 블록 사이 삽입 프리뷰 위치 반영
- `compose-shell.tsx` — `handlePreviewBlock`이 `insertIndex` 소비, `handleConfirmPlace`가 `splice(insertAt)` 사용
- `block-canvas.tsx` — `GhostBlock` 컴포넌트 추출, `insertAt` 위치에 렌더링

### Phase 2: AI 패널 우측 통합
- `ai-generation-panel.tsx` — `AiGenerationPanel` → `AiGenerateTab`으로 리팩터 (슬라이드 → 탭 내 세로 레이아웃)
- `right-panel.tsx` — 속성/AI생성 탭 기반 패널로 확장
- `block-properties-panel.tsx` — 외부 래퍼 스타일을 right-panel로 이동
- `compose-toolbar.tsx` — "AI 생성" 토글 버튼 제거
- `compose-shell.tsx` — `aiPanelOpen` state 및 AiGenerationPanel 렌더 제거

### Phase 3: BlockTextGenerator 제거
- `block-properties-panel.tsx` — 14곳의 BlockTextGenerator JSX 제거 (-326줄)
- `shared/block-text-generator.tsx` — 파일 삭제 (-219줄)
- AI 문구 생성은 우측 패널 "AI 생성" 탭으로 통일 (드래그드롭 방식)

## Vercel 배포 환경변수

### 필수 (Required)
| 변수 | 용도 | 예시 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (브라우저/미들웨어) | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (서버 전용, RLS 우회) | `eyJ...` |
| `NEXT_PUBLIC_APP_URL` | 프로덕션 URL (콜백/API 내부 호출) | `https://takdizang.vercel.app` |

### AI 프로바이더 (프로덕션용)
| 변수 | 용도 | 비고 |
|---|---|---|
| `GEMINI_API_KEY` | Gemini 텍스트/스크립트 생성 | 없으면 mock 폴백 |
| `KIE_API_KEY` | Kie.ai 이미지 생성/모델컷/누끼/썸네일 | 없으면 mock 폴백 |

### 선택 (Optional)
| 변수 | 기본값 | 용도 |
|---|---|---|
| `USE_MOCK` | `undefined` | `"true"` 시 모든 외부 API 우회 |
| `NEXT_PUBLIC_SITE_URL` | `https://takdi.studio` | sitemap 생성용 |
| `IMAGE_PROVIDER` | `kie` | 이미지 프로바이더 오버라이드 |
| `DEFAULT_WORKSPACE_NAME` | `Takdi Studio` | 기본 워크스페이스 이름 |

> **주의**: `USE_MOCK=true`를 설정하면 AI 기능은 placeholder로 동작. 프로덕션에서는 반드시 제거하고 실제 API 키 사용.

## Supabase 추가 설정

### 1. Migration 적용 (필수)
5개 마이그레이션 파일이 로컬에만 존재 → Supabase에 적용 필요:
```
supabase/migrations/20260315000000_takdi_core.sql        # 코어 테이블
supabase/migrations/20260315232500_storage_buckets.sql    # 스토리지 버킷
supabase/migrations/20260316100000_schema_cleanup.sql     # JSONB 변환 + CHECK 제약
supabase/migrations/20260316100100_auth_schema.sql        # profiles + workspace_members
supabase/migrations/20260316100200_rls_policies.sql       # RLS 정책
```
방법: `npx supabase link --project-ref <ref>` → `npx supabase db push`
또는 Supabase Dashboard SQL Editor에서 순서대로 실행.

### 2. Auth URL 설정 (필수)
Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://takdizang.vercel.app`
- **Redirect URLs**: `https://takdizang.vercel.app/**`

### 3. Auth Provider 설정 (필수)
Supabase Dashboard → Authentication → Providers:
- **Email**: 활성화 (기본)
- **Google OAuth**: Client ID + Secret 설정 필요
  - Google Cloud Console → OAuth 2.0 → Redirect URI: `https://fpejnupyptyxwfhvmsop.supabase.co/auth/v1/callback`

### 4. Storage Bucket 확인
migration에서 자동 생성되지만 확인 필요:
- `project-assets` (public)
- `artifacts` (public)
- `thumbnails` (public)

### 5. Seed 데이터 (선택)
`supabase/seed.sql` — 개발용 샘플 데이터. 프로덕션에서는 불필요.

## Deployment
- **Vercel**: `https://takdizang.vercel.app`
- **Supabase**: `https://fpejnupyptyxwfhvmsop.supabase.co` (ref: `fpejnupyptyxwfhvmsop`)
- **현재 모드**: `USE_MOCK=true` (AI 기능 placeholder)

## Important Open Issues
- **Migration 미적용**: 5개 migration 파일 Supabase에 적용 필요
- **Supabase Auth URL 설정 필요**: Site URL + Redirect URLs
- `NEXT_PUBLIC_APP_URL` Vercel 환경변수 추가 필요
- `GEMINI_API_KEY` 비활성 → 블록 텍스트 생성 mock 폴백
- `KIE_API_KEY` 크레딧 부족 → 이미지 생성 mock 폴백

## Recommended Next Steps
1. Vercel 환경변수에 `NEXT_PUBLIC_APP_URL=https://takdizang.vercel.app` 추가
2. Supabase Auth URL 설정 (Site URL + Redirect URLs)
3. Supabase migration 적용 (5개 파일 순서대로)
4. Google OAuth 설정 (선택)
5. `GEMINI_API_KEY`, `KIE_API_KEY` 활성화
6. 프로덕션 E2E 검증

## Validation Commands
- `npm run typecheck` — 0 errors 확인
- `npm run build` — 빌드 성공 확인
- `npm test`
- `npx playwright test`
