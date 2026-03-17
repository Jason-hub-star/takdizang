# Migration Notes

## Purpose
- Takdizang v1 DB foundation for profiles, credits, projects, jobs, assets, artifacts, and storage policies.

## Files
- `20260315_001_takdi_core.sql`: base schema (workspaces, projects, assets, jobs, artifacts, templates, usage)
- `20260315232500_storage_buckets.sql`: Supabase Storage bucket setup
- `20260316_001_schema_cleanup.sql`: TEXT→JSONB, CHECK constraints, composite indexes, updated_at
- `20260316_002_auth_schema.sql`: profiles, workspace_members, auto-provisioning trigger
- `20260316_003_rls_policies.sql`: RLS policies with performance-optimized helper functions

## Conventions
- Prefer additive SQL.
- Include RLS, triggers, and indexes in the same migration when they are tightly coupled.
- Use `DO $$` blocks for idempotent constraint additions.
- RLS policies use `(select auth.uid())` pattern for performance.
