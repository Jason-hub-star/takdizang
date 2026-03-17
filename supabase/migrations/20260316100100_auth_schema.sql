-- Phase 1-A: Auth schema — profiles, workspace_members, auto-provisioning trigger

-----------------------------------------------------------------------
-- profiles: 1:1 with auth.users
-----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-----------------------------------------------------------------------
-- workspace_members: user ↔ workspace join table
-- workspace_id is TEXT to match existing workspaces.id
-----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_wm_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wm_workspace_id ON workspace_members(workspace_id);

-----------------------------------------------------------------------
-- Auth trigger: auto-create profile + workspace on signup
-----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE ws_id TEXT;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));

  -- Create personal workspace
  ws_id := gen_random_uuid()::text;
  INSERT INTO public.workspaces (id, name)
  VALUES (ws_id, COALESCE(NEW.raw_user_meta_data->>'name', 'My Workspace'));

  -- Link user → workspace as owner
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (ws_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
