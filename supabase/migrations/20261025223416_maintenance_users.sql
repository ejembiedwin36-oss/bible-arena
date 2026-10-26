-- Production history:
-- 20261025223408 add_maintenance_users
-- 20261025223416 expose_maintenance_users_to_service_role
--
-- Repository representation of the final schema used by the secured
-- maintenance Edge Functions. User assignments are operational data and
-- intentionally are not hard-coded in this migration.

create table if not exists public.maintenance_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.maintenance_users enable row level security;

revoke all on table public.maintenance_users from public, anon, authenticated;
grant select on table public.maintenance_users to service_role;
