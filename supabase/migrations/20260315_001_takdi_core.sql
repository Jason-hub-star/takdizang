create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.workspaces (
  id text primary key,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  brief_text text,
  mode text,
  editor_mode text default 'flow',
  template_key text,
  content text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assets (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects(id) on delete cascade,
  source_type text not null default 'uploaded',
  file_path text not null,
  mime_type text,
  preserve_original boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.generation_jobs (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects(id) on delete cascade,
  status text not null default 'queued',
  provider text,
  input text,
  output text,
  error text,
  started_at timestamptz,
  done_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.export_artifacts (
  id text primary key default gen_random_uuid()::text,
  project_id text not null references public.projects(id) on delete cascade,
  type text not null,
  file_path text not null,
  metadata text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.usage_ledger (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  event_type text not null,
  detail text,
  cost_estimate double precision,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.compose_templates (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  name text not null,
  snapshot text not null,
  preview_title text,
  block_count integer not null default 0,
  source_project_id text references public.projects(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_projects_workspace_id on public.projects (workspace_id);
create index if not exists idx_assets_project_id on public.assets (project_id);
create index if not exists idx_generation_jobs_project_id on public.generation_jobs (project_id);
create index if not exists idx_export_artifacts_project_id on public.export_artifacts (project_id);
create index if not exists idx_usage_ledger_workspace_id on public.usage_ledger (workspace_id);
create index if not exists idx_compose_templates_workspace_id on public.compose_templates (workspace_id);

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists compose_templates_set_updated_at on public.compose_templates;
create trigger compose_templates_set_updated_at
before update on public.compose_templates
for each row execute function public.set_updated_at();

insert into public.workspaces (id, name)
values ('default-workspace', 'Takdi Studio')
on conflict (id) do update
set name = excluded.name;
