create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
drop policy if exists "Public reads site settings" on public.site_settings;
create policy "Public reads site settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "Shop managers insert shop settings" on public.site_settings;
create policy "Shop managers insert shop settings" on public.site_settings as restrictive for insert to authenticated
with check (key = 'shop_visibility' and public.has_dashboard_permission('shop'));
drop policy if exists "Shop managers update shop settings" on public.site_settings;
create policy "Shop managers update shop settings" on public.site_settings as restrictive for update to authenticated
using (key = 'shop_visibility' and public.has_dashboard_permission('shop'))
with check (key = 'shop_visibility' and public.has_dashboard_permission('shop'));

insert into public.site_settings (key, value)
values ('shop_visibility', '{"visible": false}'::jsonb)
on conflict (key) do nothing;
