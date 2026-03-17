-- Phase 1-F: RLS policies with performance-optimized helper functions
-- Uses (select auth.uid()) pattern to prevent per-row function evaluation

-----------------------------------------------------------------------
-- Helper functions (STABLE = cached per statement)
-----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_workspace_ids()
RETURNS SETOF TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT workspace_id FROM public.workspace_members
  WHERE user_id = (select auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.get_my_project_ids()
RETURNS SETOF TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT id FROM public.projects
  WHERE workspace_id IN (SELECT public.get_my_workspace_ids());
$$;

-----------------------------------------------------------------------
-- Enable RLS on all tables
-----------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compose_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-----------------------------------------------------------------------
-- Policies: workspace-scoped tables
-----------------------------------------------------------------------
CREATE POLICY "ws_member_access" ON public.workspaces
  FOR ALL TO authenticated
  USING (id IN (SELECT public.get_my_workspace_ids()));

CREATE POLICY "proj_ws_isolation" ON public.projects
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.get_my_workspace_ids()));

CREATE POLICY "asset_ws_isolation" ON public.assets
  FOR ALL TO authenticated
  USING (project_id IN (SELECT public.get_my_project_ids()));

CREATE POLICY "job_ws_isolation" ON public.generation_jobs
  FOR ALL TO authenticated
  USING (project_id IN (SELECT public.get_my_project_ids()));

CREATE POLICY "export_ws_isolation" ON public.export_artifacts
  FOR ALL TO authenticated
  USING (project_id IN (SELECT public.get_my_project_ids()));

CREATE POLICY "usage_ws_isolation" ON public.usage_ledger
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.get_my_workspace_ids()));

CREATE POLICY "template_ws_isolation" ON public.compose_templates
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.get_my_workspace_ids()));

-----------------------------------------------------------------------
-- Policies: user-scoped tables
-----------------------------------------------------------------------
CREATE POLICY "own_profile" ON public.profiles
  FOR ALL TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "own_memberships" ON public.workspace_members
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()));

-----------------------------------------------------------------------
-- Service role bypass: admin client uses service_role key which
-- bypasses RLS by default. No additional policy needed.
-----------------------------------------------------------------------
