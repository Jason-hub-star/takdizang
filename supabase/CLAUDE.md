# supabase/
Database migrations and Supabase-specific infrastructure notes.

## Files
- `migrations/20260315_001_takdi_core.sql`: base schema (workspaces, projects, assets, jobs, templates, usage)
- `migrations/20260315232500_storage_buckets.sql`: Storage bucket setup
- `migrations/20260316_001_schema_cleanup.sql`: TEXT→JSONB, CHECK constraints, indexes, updated_at
- `migrations/20260316_002_auth_schema.sql`: profiles, workspace_members, auth trigger
- `migrations/20260316_003_rls_policies.sql`: RLS policies + helper functions
- `seed.sql`: sample data (8 projects, assets, templates, usage events)

## Convention
- Add new runtime schema changes as forward-only SQL migrations.
- Keep table and column names aligned with the compatibility layer in `src/lib/prisma.ts`.
- Use `DO $$` blocks for idempotent constraint additions.
