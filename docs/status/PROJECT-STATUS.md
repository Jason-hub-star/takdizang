# Takdizang Project Status

Last Updated: 2026-03-15 (KST, Supabase storage migration + artifact smoke review)

## Latest Update
- Imported a Takdi-style docs operating process into this repo:
  - root `CLAUDE.md` now points to `docs/status` and `docs/ref`
  - added status docs (`PROJECT-STATUS`, `FEATURE-MATRIX`, `CLAUDE-HANDOFF`)
  - added reference docs (`ARCHITECTURE`, `SCHEMA-INDEX`)
- Runtime data layer now runs on Supabase instead of Prisma.
- Uploads and generated artifacts now persist to Supabase Storage while the app keeps the `/uploads/...` public path contract.
- Applied storage bucket migration on the production Supabase project:
  - `project-assets`
  - `artifacts`
  - `thumbnails`
- Verified end-to-end storage smoke path:
  - create project
  - upload image asset
  - load `/uploads/...` and preview derivative
  - open `/compose`, `/editor`, `/preview`, `/result`
  - delete project
  - confirm storage prefix becomes empty after propagation
- Additional artifact smoke review found provider-level blockers rather than app contract bugs:
  - Kie thumbnail generation currently fails with insufficient credits
  - Gemini marketing-script generation currently fails because the configured key is flagged as leaked

## Current Phase
- Separate public-facing Takdi clone repo established.
- Takdi UI and route structure copied into `takdizang`.
- Landing page intentionally left separate at `/landing`.
- Infra migration status:
  - Prisma removed from runtime
  - Ollama removed
  - ComfyUI removed
  - Supabase Postgres active
  - Supabase Storage active
  - Kie.ai retained
  - Gemini retained
  - Remotion retained

## Current Snapshot
- App routes available:
  - `/`
  - `/projects`
  - `/workspace`
  - `/settings`
  - `/landing`
  - project subroutes for `compose`, `editor`, `preview`, `result`
- API surface currently includes 23 route handlers under `src/app`.
- Runtime storage behavior:
  - asset uploads normalize to WebP + preview where applicable
  - `/uploads/[...path]` now proxies from Supabase Storage
  - project deletion clears DB rows and then removes the project storage prefix

## Validation
- `npm run build`
- `npm run typecheck`
- `npm test`
- `npx supabase migration repair 20260315 --status reverted --db-url ... --yes`
- `npx supabase db push --db-url ... --include-all --yes`
- Storage smoke:
  - home/projects/workspace/settings/landing all returned HTTP 200
  - project creation returned HTTP 201
  - asset upload returned HTTP 201
  - uploaded image and preview both returned HTTP 200 through `/uploads/...`
  - deletion eventually reduced the storage prefix to zero objects

## Known Risks
- Thumbnail smoke is currently blocked by external Kie credits, not by internal route/storage logic.
- Marketing-script smoke is currently blocked by the configured Gemini key status.
- Windows/Next.js can occasionally leave `.next` in a bad state during repeated dev/prod restarts; clearing `.next` and rebuilding has been the reliable recovery path.

## Next Actions
1. Replace the blocked `GEMINI_API_KEY` and rerun marketing-script + export smoke.
2. Recharge or replace the `KIE_API_KEY` and rerun thumbnail smoke.
3. Add a small ops note for clearing `.next` when local Next chunk-cache corruption appears.
