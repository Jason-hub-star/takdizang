# Feature Matrix

Last Updated: 2026-03-17 (KST, Compose AI UX v4 반영)
Status enum: `Not Started | In Progress | Done | Blocked | Deferred`

| ID | Feature | Status | Owner | Notes |
|---|---|---|---|---|
| DOCS-001 | Takdi-style docs process import | Done | codex | Root `CLAUDE.md` + `docs/status` + `docs/ref` added |
| INFRA-001 | Takdi UI/route copy into separate repo | Done | codex | Public repo keeps Takdi screens and route structure |
| INFRA-002 | Supabase-backed Prisma compatibility adapter | Done | codex | `src/lib/prisma.ts` maps Prisma API onto Supabase |
| INFRA-003 | Prisma removal from runtime | Done | codex | Runtime uses Supabase directly |
| INFRA-004 | Ollama removal | Done | codex | Local LLM dependency removed |
| INFRA-005 | ComfyUI removal | Done | codex | Local image provider stack removed |
| INFRA-006 | Kie-only image provider registry | Done | codex | Provider registry favors Kie for image generation |
| INFRA-007 | Supabase storage buckets | Done | codex | `project-assets`, `artifacts`, `thumbnails` buckets |
| INFRA-008 | `/uploads` proxy over Supabase Storage | Done | codex | UI consumes `/uploads/...`, backend serves from Storage |
| INFRA-009 | Project deletion storage cleanup | Done | codex | DB delete clears storage prefix |
| QA-001 | Storage smoke test | Done | codex | Project create/upload/view/delete validated |
| QA-002 | Thumbnail artifact smoke | Blocked | codex | Blocked by Kie credit insufficiency |
| QA-003 | Marketing-script artifact smoke | Blocked | codex | Blocked by disabled Gemini API key |
| QA-004 | Export artifact smoke | In Progress | codex | Waiting on upstream providers |
| QA-005 | Playwright visual regression tests | Done | claude | 4 pages × 3 viewports, baseline snapshots saved |
| LANDING-001 | Custom marketing landing page | Deferred | unassigned | `/landing` intentionally left open |
| UI-001 | DB seed data insertion | Done | claude | 8 projects + 10 assets + 3 templates + 12 usage + 4 jobs + 3 exports |
| UI-002 | Landing page text improvement | Done | claude | 개발자 placeholder → 사용자 대상 소개 문구 |
| UI-003 | Sidebar Mac Mini+NAS card removal | Done | claude | 불필요한 인프라 카드 제거 |
| UI-004 | Mode card spacing/height fix | Done | claude | min-h-[168px], p-6, max 4열 그리드 |
| UI-005 | Settings SummaryCard height uniformity | Done | claude | min-h-[140px] 추가 |
| COMPOSE-001 | Workspace asset browser | Done | claude | `GET /api/workspace/assets` + AssetGrid scope 모드 |
| COMPOSE-002 | Block-level AI text generation | Done | claude | AiGenerateTab 단일 통합 (드래그드롭 방식) |
| COMPOSE-003 | Model compose in-block integration | Done | claude | ModelComposeAction → hero/image-full/image-text |
| COMPOSE-004 | Remove-bg in-block integration | Done | claude | RemoveBgAction → hero/image-full/image-text |
| COMPOSE-005 | Product URL auto-fill | Not Started | unassigned | URL → 상품 정보 크롤링 → 블록 자동 채움 |
| COMPOSE-006 | Version history | Not Started | unassigned | 저장 이력 비교/복원 |
| COMPOSE-007 | Block text generation UX (tone/prompt/preview) | Done | claude | AiGenerateTab: 톤 프리셋 5종 + 자유 프롬프트 + 결과 드래그칩 |
| COMPOSE-008 | Model compose prompt input | Done | claude | 스타일/포즈 프롬프트 입력 → briefText와 결합 |
| COMPOSE-009 | AI image generation in-block | Done | claude | ImageGenerateAction → hero/image-full/image-text + image-grid/comparison |
| COMPOSE-010 | AI Hub → right panel tab refactor | Done | claude | 우측 패널 "속성/AI 생성" 탭 통합, 툴바 AI 도구 드롭다운/모달 유지 |
| COMPOSE-011 | BlockTextGenerator removal | Done | claude | 14개 블록 인라인 AI 제거 → AiGenerateTab으로 단일화 (-548줄) |
| COMPOSE-012 | Insert preview at position | Done | claude | ghost block이 insertAt 위치에 표시 (기존: 항상 맨 끝) |
| SCHEMA-001 | TEXT→JSONB migration | Done | claude | content, input, output, metadata, snapshot, detail → JSONB + GIN indexes |
| SCHEMA-002 | CHECK constraints | Done | claude | project status/mode, job status 표준화 |
| SCHEMA-003 | Composite indexes + updated_at | Done | claude | 4개 테이블 updated_at 추가, 3개 복합 인덱스 |
| AUTH-001 | Auth schema (profiles + workspace_members) | Done | claude | profiles, workspace_members, auto-provisioning trigger |
| AUTH-002 | Supabase SSR auth clients | Done | claude | server.ts, browser.ts + @supabase/ssr 패키지 |
| AUTH-003 | Next.js middleware (session guard) | Done | claude | 미인증 → /login redirect, public 경로 허용 |
| AUTH-004 | Login/signup pages | Done | claude | email/password + Google OAuth, (auth) route group |
| AUTH-005 | workspace-guard async rewrite | Done | claude | getAuthContext() 기반, 24+ API route await 전환 |
| AUTH-006 | RLS policies | Done | claude | 9개 테이블 RLS, get_my_workspace_ids() 헬퍼 |
| AUTH-007 | /uploads auth protection | Done | claude | 세션 체크 추가 |
| AUTH-008 | Sidebar profile + logout | Done | claude | 아바타/이름 표시, 로그아웃 버튼 |
| USAGE-001 | Usage limit guard | Done | claude | 월간 사용량 체크, free-tier 한도 |
| JSONB-001 | JSON.parse/stringify JSONB compatibility | Done | claude | parseJsonField 유틸 + 20+ 파일 안전 파싱 전환 |
| EDITOR-001 | React Flow 노드 그래프 에디터 | Done | claude | node-editor-shell.tsx 기반 그래프 편집 |
| EDITOR-002 | 6개 모드별 파이프라인 실행 | Done | claude | shortform-video, model-shot, cutout, brand-image, freeform, gif-source |
| EDITOR-003 | Simple/Expert 뷰 모드 전환 | Done | claude | 가이드 4개 모드(simple) + 자유 2개 모드(expert) |
| EDITOR-004 | 가이드 그래프 검증 + 자동 복구 UI | Done | claude | 누락 노드/엣지 감지 → 자동 복구 |
| EDITOR-005 | Step Editor 위저드 (simple 모드) | Done | claude | 3그룹 분류 단계별 편집 |
| EDITOR-006 | Remotion 프리뷰 (3비율) + 내보내기 폴링 | Done | claude | 9:16, 1:1, 16:9 비율 + 렌더링 상태 폴링 |
| EDITOR-007 | 에셋 업로드 (이미지/BGM) | Done | claude | 인라인 라이트박스 + BGM 업로드 |
| EDITOR-008 | Undo/Redo (50 스택) + 자동저장 (30초) | Done | claude | Compose와 동일 패턴 |
| EDITOR-009 | 프로젝트 이름 인라인 편집 | Done | claude | 에디터 헤더 내 편집 |
| EDITOR-010 | 키보드 단축키 | Done | claude | Ctrl+S/Enter/Z, Esc, Delete |
| DEPLOY-001 | Vercel 배포 | In Progress | jason | 환경변수 설정 + 첫 배포 준비 중 |
