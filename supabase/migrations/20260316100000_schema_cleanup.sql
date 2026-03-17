-- Phase 0: Schema Cleanup — TEXT→JSONB, CHECK constraints, indexes, updated_at
-- This migration prepares the schema for auth integration.

-----------------------------------------------------------------------
-- 0-A. TEXT → JSONB conversion + GIN indexes
-----------------------------------------------------------------------
-- Safe JSONB conversion: NULL stays NULL, valid JSON → JSONB, invalid → wrapped as JSON string
ALTER TABLE projects ALTER COLUMN content TYPE JSONB
  USING CASE WHEN content IS NULL THEN NULL
             WHEN content ~ '^\s*[\[{"]' THEN content::jsonb
             ELSE to_jsonb(content) END;
ALTER TABLE generation_jobs ALTER COLUMN input TYPE JSONB
  USING CASE WHEN input IS NULL THEN NULL
             WHEN input ~ '^\s*[\[{"]' THEN input::jsonb
             ELSE to_jsonb(input) END;
ALTER TABLE generation_jobs ALTER COLUMN output TYPE JSONB
  USING CASE WHEN output IS NULL THEN NULL
             WHEN output ~ '^\s*[\[{"]' THEN output::jsonb
             ELSE to_jsonb(output) END;
ALTER TABLE export_artifacts ALTER COLUMN metadata TYPE JSONB
  USING CASE WHEN metadata IS NULL THEN NULL
             WHEN metadata ~ '^\s*[\[{"]' THEN metadata::jsonb
             ELSE to_jsonb(metadata) END;
ALTER TABLE compose_templates ALTER COLUMN snapshot TYPE JSONB
  USING CASE WHEN snapshot IS NULL THEN NULL
             WHEN snapshot ~ '^\s*[\[{"]' THEN snapshot::jsonb
             ELSE to_jsonb(snapshot) END;
ALTER TABLE usage_ledger ALTER COLUMN detail TYPE JSONB
  USING CASE WHEN detail IS NULL THEN NULL
             WHEN detail ~ '^\s*[\[{"]' THEN detail::jsonb
             ELSE to_jsonb(detail) END;

-- GIN indexes (jsonb_path_ops: smaller, supports @> operator)
CREATE INDEX IF NOT EXISTS idx_projects_content_gin ON projects USING gin (content jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_usage_detail_gin ON usage_ledger USING gin (detail jsonb_path_ops);

-----------------------------------------------------------------------
-- 0-B. Data cleanup: standardize status values before adding constraints
-----------------------------------------------------------------------
UPDATE projects SET status = 'exported' WHERE status IN ('published', 'completed');
UPDATE projects SET status = 'generating' WHERE status = 'processing';
UPDATE projects SET status = 'generated' WHERE status = 'done';
UPDATE generation_jobs SET status = 'done' WHERE status = 'completed';

-----------------------------------------------------------------------
-- 0-B. CHECK constraints (idempotent via DO $$ block)
-----------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_project_status') THEN
    ALTER TABLE projects ADD CONSTRAINT chk_project_status
      CHECK (status IN ('draft','generating','generated','failed','exported'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_project_mode') THEN
    ALTER TABLE projects ADD CONSTRAINT chk_project_mode
      CHECK (mode IS NULL OR mode IN ('compose','shortform-video','model-shot','cutout','brand-image','gif-source','freeform'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_job_status') THEN
    ALTER TABLE generation_jobs ADD CONSTRAINT chk_job_status
      CHECK (status IN ('queued','running','done','failed'));
  END IF;
END $$;

-----------------------------------------------------------------------
-- 0-C. Composite indexes (equality first, range last)
-----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_workspace_created ON projects(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_project_status ON generation_jobs(project_id, status);
CREATE INDEX IF NOT EXISTS idx_usage_workspace_created ON usage_ledger(workspace_id, created_at DESC);

-----------------------------------------------------------------------
-- 0-C. Missing updated_at columns + triggers
-----------------------------------------------------------------------
ALTER TABLE assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE generation_jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE export_artifacts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE usage_ledger ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Triggers (reuse existing set_updated_at function)
DROP TRIGGER IF EXISTS assets_set_updated_at ON public.assets;
CREATE TRIGGER assets_set_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS generation_jobs_set_updated_at ON public.generation_jobs;
CREATE TRIGGER generation_jobs_set_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS export_artifacts_set_updated_at ON public.export_artifacts;
CREATE TRIGGER export_artifacts_set_updated_at
  BEFORE UPDATE ON public.export_artifacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS usage_ledger_set_updated_at ON public.usage_ledger;
CREATE TRIGGER usage_ledger_set_updated_at
  BEFORE UPDATE ON public.usage_ledger
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
