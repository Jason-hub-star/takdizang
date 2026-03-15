# Takdizang

`takdi`의 UI와 핵심 편집 흐름을 그대로 옮긴 별도 실행 레포입니다.

## Current stack

- Next.js App Router
- Supabase Postgres for runtime data
- Supabase Storage for project assets and artifacts behind the `/uploads/*` proxy route
- Gemini for text generation and marketing script generation
- Kie.ai for image generation and background removal
- Remotion for preview and render flows

## Local setup

1. Copy `.env.example` to `.env.local`
2. Fill in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Fill in `SUPABASE_SERVICE_ROLE_KEY` when you want elevated writes from the server
4. Fill in `GEMINI_API_KEY` and `KIE_API_KEY`
5. Run `npx supabase init --force --yes`
6. Link the remote project when you have the database password:
   `npx supabase link --project-ref fpejnupyptyxwfhvmsop --password <db-password>`
7. Apply both Supabase migrations:
   - `supabase/migrations/20260315_001_takdi_core.sql`
   - `supabase/migrations/20260315232500_storage_buckets.sql`
8. Run `npm install`
9. Run `npm run dev`

## Routes

- `/` Takdi home
- `/projects` projects list
- `/workspace` workspace dashboard
- `/settings` runtime and storage summary
- `/landing` future landing page placeholder

## Notes

- `Prisma`, `Ollama`, and `ComfyUI` are removed from this repo.
- Data access now goes through a Supabase-backed compatibility layer at `src/lib/prisma.ts`.
- Uploaded files now live in Supabase Storage while the UI keeps using `/uploads/...` paths.
- Debug global navigation stays enabled with `NEXT_PUBLIC_DEBUG_GLOBAL_NAV=true`.
