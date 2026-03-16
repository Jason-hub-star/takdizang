-- ============================================================
-- Takdizang Subscription & Credit System
-- 구독제 + 크레딧 기반 가격 정책 스키마
-- ============================================================

-- 1. profiles: Supabase Auth 연동 사용자 프로필
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 2. workspace_members: 워크스페이스 멤버십
create table if not exists public.workspace_members (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',  -- owner | admin | member
  created_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, user_id)
);

create index idx_workspace_members_user on public.workspace_members (user_id);
create index idx_workspace_members_workspace on public.workspace_members (workspace_id);

-- 3. pricing_tiers: 구독 티어 정의 (seed data)
create table if not exists public.pricing_tiers (
  id text primary key,                    -- free, starter, pro, business
  name text not null,
  monthly_price integer not null default 0,  -- 원 단위
  yearly_price integer not null default 0,
  monthly_credits integer not null default 0,
  max_projects integer,                    -- null = 무제한
  max_members integer not null default 1,
  max_templates integer,                   -- null = 무제한
  storage_bytes bigint not null default 104857600,  -- 기본 100MB
  max_concurrent_jobs integer not null default 1,
  max_upload_bytes integer not null default 5242880,  -- 5MB
  rate_limit_per_min integer not null default 10,
  has_watermark boolean not null default true,
  has_hd_export boolean not null default false,
  has_priority boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

-- 4. subscriptions: 워크스페이스별 구독 상태
create table if not exists public.subscriptions (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  tier_id text not null references public.pricing_tiers(id) default 'free',
  status text not null default 'active',  -- active | past_due | canceled | trialing
  billing_cycle text not null default 'monthly',  -- monthly | yearly
  current_period_start timestamptz not null default timezone('utc', now()),
  current_period_end timestamptz not null default timezone('utc', now()) + interval '30 days',
  stripe_subscription_id text,
  stripe_customer_id text,
  canceled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id)
);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- 5. credit_balances: 워크스페이스별 크레딧 잔고
create table if not exists public.credit_balances (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  monthly_credits integer not null default 0,     -- 이번 주기 잔여 월 크레딧
  purchased_credits integer not null default 0,   -- 추가 구매 크레딧 (이월됨)
  period_start timestamptz not null default timezone('utc', now()),
  period_end timestamptz not null default timezone('utc', now()) + interval '30 days',
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id)
);

create trigger credit_balances_set_updated_at
before update on public.credit_balances
for each row execute function public.set_updated_at();

-- 6. credit_transactions: 크레딧 차감/충전 이력
create table if not exists public.credit_transactions (
  id text primary key default gen_random_uuid()::text,
  workspace_id text not null references public.workspaces(id) on delete cascade,
  type text not null,           -- debit | credit_monthly | credit_purchase | credit_refund
  amount integer not null,      -- 양수 = 충전, 음수 = 차감
  balance_after integer not null,
  source text not null,         -- 차감 사유: text_generation, image_generation, remove_bg, model_compose, video_render, export, thumbnail, credit_pack, subscription_reset
  reference_id text,            -- generation_job.id 또는 stripe payment_intent ID
  created_at timestamptz not null default timezone('utc', now())
);

create index idx_credit_transactions_workspace on public.credit_transactions (workspace_id);
create index idx_credit_transactions_created on public.credit_transactions (created_at);

-- 7. credit_costs: 작업별 크레딧 소비 단가 (설정 테이블)
create table if not exists public.credit_costs (
  event_type text primary key,   -- usage_ledger.event_type과 동일한 값 사용
  credits integer not null,
  label text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- 8. usage_ledger 확장: 크레딧 차감량 컬럼 추가
alter table public.usage_ledger
  add column if not exists credits_consumed integer default 0;

-- ============================================================
-- Seed Data
-- ============================================================

-- 구독 티어 시드
insert into public.pricing_tiers (id, name, monthly_price, yearly_price, monthly_credits, max_projects, max_members, max_templates, storage_bytes, max_concurrent_jobs, max_upload_bytes, rate_limit_per_min, has_watermark, has_hd_export, has_priority)
values
  ('free',     'Free',     0,      0,       30,    3,    1,  2,    104857600,    1,  5242880,   10,  true,  false, false),
  ('starter',  'Starter',  19900,  191000,  500,   30,   1,  20,   2147483648,  3,  20971520,  30,  false, true,  false),
  ('pro',      'Pro',      49900,  479000,  2000,  null, 3,  null, 10737418240, 5,  20971520,  60,  false, true,  true),
  ('business', 'Business', 99900,  959000,  6000,  null, 10, null, 53687091200, 10, 20971520,  120, false, true,  true)
on conflict (id) do update set
  name = excluded.name,
  monthly_price = excluded.monthly_price,
  yearly_price = excluded.yearly_price,
  monthly_credits = excluded.monthly_credits,
  max_projects = excluded.max_projects,
  max_members = excluded.max_members,
  max_templates = excluded.max_templates,
  storage_bytes = excluded.storage_bytes,
  max_concurrent_jobs = excluded.max_concurrent_jobs,
  max_upload_bytes = excluded.max_upload_bytes,
  rate_limit_per_min = excluded.rate_limit_per_min,
  has_watermark = excluded.has_watermark,
  has_hd_export = excluded.has_hd_export,
  has_priority = excluded.has_priority;

-- 크레딧 단가 시드
insert into public.credit_costs (event_type, credits, label)
values
  ('text_generation',    1,  'AI 텍스트 생성'),
  ('image_generation',   5,  '이미지 생성'),
  ('remove_bg',          3,  '배경 제거'),
  ('model_compose',      8,  '모델 합성'),
  ('video_render',       10, '영상/GIF 렌더'),
  ('export_complete',    2,  '내보내기'),
  ('thumbnail',          1,  '썸네일 생성')
on conflict (event_type) do update set
  credits = excluded.credits,
  label = excluded.label;

-- default-workspace에 Free 구독 자동 생성
insert into public.subscriptions (workspace_id, tier_id, status)
values ('default-workspace', 'free', 'active')
on conflict (workspace_id) do nothing;

insert into public.credit_balances (workspace_id, monthly_credits, purchased_credits)
values ('default-workspace', 30, 0)
on conflict (workspace_id) do nothing;
