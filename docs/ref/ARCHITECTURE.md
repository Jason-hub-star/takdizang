# Takdizang Architecture

## Overview
Takdizang is a separate repo that keeps the Takdi app UI and route flow while swapping the original local-first runtime assumptions for hosted Supabase infrastructure.

## Runtime Layers
- `src/app`
  - App Router pages and route handlers copied from Takdi
  - `/landing` kept separate for future custom marketing work
- `src/components`
  - copied operator-facing Takdi UI
- `src/lib`
  - shared helpers, Supabase compatibility layer, editor/runtime state utilities
- `src/lib/supabase`
  - `admin.ts`: server-side client bootstrap
  - `storage.ts`: public upload path to Supabase Storage bridge
- `src/services`
  - provider-facing logic such as Gemini, Kie, BGM analysis, and brief parsing
- `supabase/migrations`
  - schema bootstrap plus storage bucket setup

## Data Model Strategy
- The copied app still calls a Prisma-like API surface internally.
- `src/lib/prisma.ts` adapts those calls onto Supabase tables.
- Runtime tables currently include:
  - `workspaces`
  - `projects`
  - `assets`
  - `generation_jobs`
  - `export_artifacts`
  - `usage_ledger`
  - `compose_templates`
  - `profiles`
  - `workspace_members`

### `project.content` 이중 포맷
- 같은 `projects.content` JSONB 컬럼을 Compose와 Editor가 공유하되, `project.mode`로 포맷을 분리:
  - **mode = `compose`** → `BlockDocument` (블록 배열 기반 상세페이지)
    - 저장: `PUT /api/projects/[id]/blocks`
  - **mode = 기타 6개** → `EditorGraph` (nodes/edges/shortform 그래프 구조)
    - 저장: `PATCH /api/projects/[id]/content`
- 런타임 상태 공유 없음. 각 페이지가 독립적으로 content를 읽고 쓴다.

## Compose/Editor 이중 페이지 아키텍처
- **Compose** (`/projects/[id]/compose`): 상세페이지(블록) 편집 허브
  - 18종 블록 팔레트, DnD 정렬/삽입, 16개 블록 AI 문구 생성
  - AI 액션: SceneCompose, ModelCompose, RemoveBg, ImageGenerate
  - AI 도구 모달: 영상 렌더링, 썸네일 생성, 마케팅 스크립트
- **Editor** (`/projects/[id]/editor`): 영상·이미지 파이프라인 허브
  - React Flow 노드 그래프, 6개 모드, 구조보기(Expert) 단일 뷰
  - 파이프라인: prompt → generate-images → bgm → cuts → render → export
  - 가이드형 모드: 구조 읽기 전용 + 검증/복구 UI, 자유형 모드: 노드 추가/복제/엣지 편집
- 내비게이션: Compose→Editor("작업 자동화"), Editor→Compose("상세페이지")
- 데이터 격리: 같은 content 필드이지만 mode에 따라 다른 포맷, 동시 편집 불가

## Storage Strategy
- Public app contract remains `/uploads/...`
- Actual persistence is Supabase Storage:
  - `project-assets`
  - `artifacts`
  - `thumbnails`
- The upload proxy route reads from Storage and returns binary responses with content type inference.
- Project delete removes all objects under `projects/{projectId}/...`

## Provider Strategy
- Kept:
  - Gemini for text generation / marketing script generation
  - Kie.ai for image generation / remove background / thumbnail generation
  - Remotion for preview/render
- Removed:
  - Prisma runtime dependency
  - Ollama
  - ComfyUI

## i18n Strategy
- `src/i18n/schema.ts` — `MessageSchema` 타입 정의 (key 구조)
- `src/i18n/messages/ko.ts` — 한국어 값
- `src/i18n/use-t.ts` — `useT()` hook (client), `getMessages()` (server)
- `src/i18n/format.ts` — 템플릿 헬퍼
- 현재 ko만 지원, 향후 다국어 확장 가능 구조

## Validation Strategy
- Static validation:
  - `npm run build`
  - `npm run typecheck`
  - `npm test` — 9파일 181테스트
  - `npx playwright test` — 12개 시각 테스트
- Infra validation:
  - Supabase migration push
  - storage smoke scripts under `scripts/`
