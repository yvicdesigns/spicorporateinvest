-- Correctif à exécuter une fois après dashboard_members_migration.sql.
-- Les droits sensibles sont stockés dans app_metadata, non modifiable par le client.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('admin', true)
where coalesce((raw_user_meta_data->>'admin')::boolean, false) = true;

drop policy if exists "Administrators manage dashboard members" on public.dashboard_members;
create policy "Administrators manage dashboard members" on public.dashboard_members for all
using (coalesce((auth.jwt()->'app_metadata'->>'admin')::boolean, false))
with check (coalesce((auth.jwt()->'app_metadata'->>'admin')::boolean, false));

create or replace function public.has_dashboard_permission(required_permission text)
returns boolean language sql stable security invoker set search_path = public as $$
  select coalesce((auth.jwt()->'app_metadata'->>'admin')::boolean, false)
    or coalesce(auth.jwt()->'app_metadata'->'permissions', '[]'::jsonb) ? required_permission;
$$;
revoke execute on function public.has_dashboard_permission(text) from public, anon;
grant execute on function public.has_dashboard_permission(text) to authenticated;

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
      execute format('drop policy if exists %I on public.%I', 'Dashboard insert ' || item.permission_name, item.table_name);
      execute format('drop policy if exists %I on public.%I', 'Dashboard update ' || item.permission_name, item.table_name);
      execute format('drop policy if exists %I on public.%I', 'Dashboard delete ' || item.permission_name, item.table_name);
      execute format('create policy %I on public.%I as restrictive for insert to authenticated with check (public.has_dashboard_permission(%L))', 'Dashboard insert ' || item.permission_name, item.table_name, item.permission_name);
      execute format('create policy %I on public.%I as restrictive for update to authenticated using (public.has_dashboard_permission(%L)) with check (public.has_dashboard_permission(%L))', 'Dashboard update ' || item.permission_name, item.table_name, item.permission_name, item.permission_name);
      execute format('create policy %I on public.%I as restrictive for delete to authenticated using (public.has_dashboard_permission(%L))', 'Dashboard delete ' || item.permission_name, item.table_name, item.permission_name);
    end if;
  end loop;
end $$;
