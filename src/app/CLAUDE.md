# app/
Next.js App Router routes, pages, and API handlers.

## Structure
- `layout.tsx`: root layout
- `page.tsx`: home dashboard
- `(auth)/login/page.tsx`: email/password + Google OAuth login
- `(auth)/signup/page.tsx`: registration
- `api/auth/callback/route.ts`: OAuth callback handler
- `landing/page.tsx`: separate marketing landing workspace (public)
- `projects/[id]/editor/page.tsx`: flow editor route
- `projects/[id]/compose/page.tsx`: compose editor route
- `projects/[id]/preview/page.tsx`: preview route
- `projects/[id]/result/page.tsx`: mode-aware result route
- `api/projects/`: project CRUD and async job routes
- `uploads/[...path]/route.ts`: upload file serving route

## API Notes
- `api/projects/[id]/thumbnail/`: shortform preview thumbnail generation
- `api/projects/[id]/marketing-script/`: shortform preview marketing-script generation
- `api/projects/[id]/generate-block-text/`: 블록 타입별 AI 문구 생성 (text-block, selling-point, review, faq, banner-strip, image-text, spec-table, cta, usage-steps, notice, price-promo, trust-badge, comparison, image-grid)
- `api/workspace/assets/`: 워크스페이스 전체 에셋 조회 (프로젝트별 그룹)
- Async API pattern stays `POST -> 202 + jobId`, `GET -> poll`

## Convention
- Keep page entry files server-first.
- Push heavy interaction into client components.
- Keep route contracts aligned with `docs/ref/SCHEMA-INDEX.md`.
