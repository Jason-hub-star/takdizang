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

## Validation Strategy
- Static validation:
  - `npm run build`
  - `npm run typecheck`
  - `npm test`
- Infra validation:
  - Supabase migration push
  - storage smoke scripts under `scripts/`
