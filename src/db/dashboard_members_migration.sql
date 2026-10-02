create table if not exists public.dashboard_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('blog_manager','branch_manager','content_manager','administrator')),
  permissions text[] not null default '{}',
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dashboard_members enable row level security;
create policy "Administrators manage dashboard members" on public.dashboard_members for all
using (coalesce((auth.jwt()->'app_metadata'->>'admin')::boolean, false))
with check (coalesce((auth.jwt()->'app_metadata'->>'admin')::boolean, false));
create policy "Members read own dashboard profile" on public.dashboard_members for select using (auth.uid() = user_id);

create or replace function public.has_dashboard_permission(required_permission text)
returns boolean language sql stable security invoker set search_path = public as $$
  select coalesce((auth.jwt()->'app_metadata'->>'admin')::boolean, false)
    or coalesce(auth.jwt()->'app_metadata'->'permissions', '[]'::jsonb) ? required_permission;
$$;
revoke execute on function public.has_dashboard_permission(text) from public, anon;
grant execute on function public.has_dashboard_permission(text) to authenticated;

-- Restrictive policies are combined with the legacy authenticated policies. They
-- ensure that hiding a module in the interface is backed by database security.
do $$
declare item record;
begin
  for item in select * from (values
    ('news','blog'), ('products','shop'),
    ('vision_images','site'), ('about_content','site'), ('contact_content','site'), ('footer_configuration','site'), ('website_logo','site'),
    ('sci_renaissance_content','branches'), ('fondation_spi_content','branches'), ('nouveau_concept_content','branches'),
    ('atelier5_content','branches'), ('la_manne_content','branches'), ('spi_alim_content','branches'), ('zen_sens_content','branches'), ('spi_energy_content','branches'),
    ('branch_whatsapp_config','communication')
  ) as configured(table_name, permission_name)
  loop
    if to_regclass('public.' || item.table_name) is not null then
      execute format('drop policy if exists %I on public.%I', 'Dashboard permission ' || item.permission_name, item.table_name);
      execute format('create policy %I on public.%I as restrictive for insert to authenticated with check (public.has_dashboard_permission(%L))', 'Dashboard insert ' || item.permission_name, item.table_name, item.permission_name);
      execute format('create policy %I on public.%I as restrictive for update to authenticated using (public.has_dashboard_permission(%L)) with check (public.has_dashboard_permission(%L))', 'Dashboard update ' || item.permission_name, item.table_name, item.permission_name, item.permission_name);
      execute format('create policy %I on public.%I as restrictive for delete to authenticated using (public.has_dashboard_permission(%L))', 'Dashboard delete ' || item.permission_name, item.table_name, item.permission_name);
    end if;
  end loop;
end $$;
