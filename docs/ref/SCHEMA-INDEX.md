# Schema Index

## Status Enums
- `Project.status`
  - `draft | generating | generated | failed | exported`

## Project Modes
- `compose`
- `shortform-video`
- `model-shot`
- `cutout`
- `brand-image`
- `gif-source`
- `freeform`

## Runtime Tables
- `workspaces`
  - `id`, `name`, `created_at`, `updated_at`
- `projects`
  - `id`, `workspace_id`, `name`, `status`, `brief_text`, `mode`, `editor_mode`, `template_key`, `content`, timestamps
- `assets`
  - `id`, `project_id`, `source_type`, `file_path`, `mime_type`, `preserve_original`, `created_at`
- `generation_jobs`
  - `id`, `project_id`, `status`, `provider`, `input`, `output`, `error`, timing fields
- `export_artifacts`
  - `id`, `project_id`, `type`, `file_path`, `metadata`, `created_at`
- `usage_ledger`
  - `id`, `workspace_id`, `event_type`, `detail`, `cost_estimate`, `created_at`
- `compose_templates`
  - `id`, `workspace_id`, `name`, `snapshot`, `preview_title`, `block_count`, `source_project_id`, timestamps

## Storage Buckets
- `project-assets`
- `artifacts`
- `thumbnails`

## Public File Contract
- All user-facing media paths continue to use `/uploads/...`
- Storage mapping is resolved internally via `src/lib/supabase/storage.ts`

## API Snapshot
- Project
  - `POST /api/projects`
  - `GET /api/projects/[id]`
  - `DELETE /api/projects/[id]`
  - `PATCH /api/projects/[id]/content`
- Assets
  - `GET /api/projects/[id]/assets`
  - `POST /api/projects/[id]/assets`
  - `POST /api/projects/[id]/bgm`
- Generation
  - `POST /api/projects/[id]/generate`
  - `GET /api/projects/[id]/generate?jobId=...`
  - `POST /api/projects/[id]/generate-images`
  - `GET /api/projects/[id]/generate-images?jobId=...`
  - `POST /api/projects/[id]/thumbnail`
  - `GET /api/projects/[id]/thumbnail?jobId=...`
  - `POST /api/projects/[id]/marketing-script`
  - `GET /api/projects/[id]/marketing-script?jobId=...`
  - `POST /api/projects/[id]/remove-bg`
  - `GET /api/projects/[id]/remove-bg?jobId=...`
  - `POST /api/projects/[id]/model-compose`
  - `GET /api/projects/[id]/model-compose?jobId=...`
  - `POST /api/projects/[id]/scene-compose`
  - `GET /api/projects/[id]/scene-compose?jobId=...`
- Remotion / Export
  - `POST /api/projects/[id]/remotion/preview`
  - `POST /api/projects/[id]/remotion/render`
  - `GET /api/projects/[id]/remotion/status`
  - `POST /api/projects/[id]/export`
  - `GET /api/projects/[id]/export?jobId=...`
- Compose
  - `GET /api/projects/[id]/blocks`
  - `PUT /api/projects/[id]/blocks`
  - `GET /api/compose-templates`
  - `POST /api/compose-templates`
  - `GET /api/compose-templates/[id]`
  - `DELETE /api/compose-templates/[id]`
  - `POST /api/compose-templates/[id]/instantiate`
