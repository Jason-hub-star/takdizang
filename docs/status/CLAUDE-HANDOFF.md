# Claude Handoff

Last Updated: 2026-03-15 (KST, storage migration stabilized)
Branch: `main`

## Current Snapshot
- `takdizang` now has its own documentation operating loop instead of relying on the original `takdi` repo only.
- Storage migration is complete:
  - asset upload routes write to Supabase Storage
  - generated images and text artifacts write to Supabase Storage
  - `/uploads/[...path]` proxies reads back out of Storage
  - project delete removes the project storage prefix
- Validation completed for:
  - build
  - typecheck
  - vitest suite
  - Supabase migration push
  - storage smoke flow

## Important Open Issue
- The remaining artifact E2E blockers are external-provider credentials:
  - Kie thumbnail job failed with insufficient credits
  - Gemini marketing-script job failed with `PERMISSION_DENIED` because the key is reported as leaked

## Recommended Next Step
1. Update `GEMINI_API_KEY`
2. Recharge or replace `KIE_API_KEY`
3. Rerun:
   - `scripts/codex-artifact-smoke.ps1`
   - `scripts/codex-storage-smoke.ps1`

## Validation Commands
- `npm run build`
- `npm run typecheck`
- `npm test`

## Cleanup Notes
- `.next` can become unstable after repeated `next dev` / `next build` / `next start` cycles on Windows.
- When route chunk errors appear, the reliable recovery is:
  1. stop all `takdizang` Next processes
  2. remove `.next`
  3. rerun `npm run build` or `npm run dev`
