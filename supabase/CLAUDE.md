# supabase/
Database migrations and Supabase-specific infrastructure notes.

## Files
- `migrations/20260315_001_takdi_core.sql`: base Takdi runtime schema for projects, assets, jobs, templates, and usage

## Convention
- Add new runtime schema changes as forward-only SQL migrations.
- Keep table and column names aligned with the compatibility layer in `src/lib/prisma.ts`.
