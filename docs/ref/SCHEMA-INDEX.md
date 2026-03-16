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

## Subscription & Credit Tables
- `profiles`
  - `id` (uuid, FK → auth.users), `display_name`, `avatar_url`, timestamps
- `workspace_members`
  - `id`, `workspace_id`, `user_id`, `role` (owner|admin|member), `created_at`
- `pricing_tiers`
  - `id` (free|starter|pro|business), `name`, `monthly_price`, `yearly_price`, `monthly_credits`, `max_projects`, `max_members`, `max_templates`, `storage_bytes`, `max_concurrent_jobs`, `max_upload_bytes`, `rate_limit_per_min`, `has_watermark`, `has_hd_export`, `has_priority`
- `subscriptions`
  - `id`, `workspace_id`, `tier_id`, `status`, `billing_cycle`, `current_period_start/end`, `stripe_subscription_id`, `stripe_customer_id`, `canceled_at`, timestamps
- `credit_balances`
  - `id`, `workspace_id`, `monthly_credits`, `purchased_credits`, `period_start/end`, `updated_at`
- `credit_transactions`
  - `id`, `workspace_id`, `type` (debit|credit_monthly|credit_purchase|credit_refund), `amount`, `balance_after`, `source`, `reference_id`, `created_at`
- `credit_costs`
  - `event_type` (PK), `credits`, `label`
- `usage_ledger` 확장: `credits_consumed` 컬럼 추가

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
  - `POST /api/projects/[id]/generate-block-text` — 블록 타입별 AI 문구 생성
  - `GET /api/compose-templates`
  - `POST /api/compose-templates`
  - `GET /api/compose-templates/[id]`
  - `DELETE /api/compose-templates/[id]`
  - `POST /api/compose-templates/[id]/instantiate`
- Workspace
  - `GET /api/workspace/assets` — 워크스페이스 전체 에셋 조회 (프로젝트별 그룹)
- Usage
  - `GET /api/usage/me` — 현재 워크스페이스 사용량 조회
- Subscription & Credits
  - `GET /api/subscription` — 현재 구독 상태 + 크레딧 잔고 조회
  - `POST /api/subscription/checkout` — Stripe 결제 세션 생성
  - `POST /api/subscription/webhook` — Stripe 웹훅 핸들러
  - `POST /api/credits/purchase` — 크레딧 추가 구매
  - `GET /api/credits/transactions` — 크레딧 거래 이력 조회

## Pricing Reference
- 정책 문서: `docs/ref/PRICING-POLICY.md`
- 크레딧 단가: `credit_costs` 테이블 (seed data in migration)
