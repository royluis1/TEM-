-- MIGRACIÓN 2 — ejecutar UNA vez en Supabase > SQL Editor (sobre lo que ya creó schema.sql).

-- 1) Grupos (los administrás vos desde Table Editor o con SQL)
create table if not exists public.grupos (
  id bigint generated always as identity primary key,
  nombre text not null unique check (char_length(nombre) between 1 and 60)
);
alter table public.grupos enable row level security;
drop policy if exists "ver grupos" on public.grupos;
create policy "ver grupos" on public.grupos for select to anon, authenticated using (true);
-- Creá tus grupos, por ejemplo:
-- insert into public.grupos (nombre) values ('Grupo 1'), ('Grupo 2');

-- 2) Perfiles: grupo y rol. El rol NO se puede cambiar desde el sitio.
alter table public.profiles add column if not exists grupo_id bigint references public.grupos(id) on delete set null;
alter table public.profiles add column if not exists rol text not null default 'alumno' check (rol in ('alumno','docente'));
revoke insert, delete, truncate on public.profiles from anon, authenticated;
revoke update on public.profiles from anon, authenticated;
grant update (full_name, grupo_id) on public.profiles to authenticated;
drop policy if exists "editar mi perfil" on public.profiles;
create policy "editar mi perfil" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, grupo_id)
  values (new.id,
          left(coalesce(new.raw_user_meta_data->>'full_name', ''), 80),
          (select g.id from public.grupos g where g.id::text = new.raw_user_meta_data->>'grupo_id'));
  return new;
end $$;

-- 3) Resultados: detalle por pregunta. Formato: [{"id":"nivel-1:3","ok":true}, ...]
alter table public.resultados add column if not exists detalle jsonb not null default '[]'::jsonb
  check (jsonb_typeof(detalle) = 'array' and jsonb_array_length(detalle) <= 50);

-- Si viene detalle, puntaje y total se calculan desde él (no pueden contradecirse).
create or replace function public.resultados_normalizar() returns trigger
language plpgsql set search_path = '' as $$
begin
  if jsonb_array_length(new.detalle) > 0 then
    new.total := jsonb_array_length(new.detalle);
    new.puntaje := (select count(*) from jsonb_array_elements(new.detalle) d where d->>'ok' = 'true');
  end if;
  return new;
end $$;
drop trigger if exists resultados_normalizar_trg on public.resultados;
create trigger resultados_normalizar_trg before insert on public.resultados
  for each row execute function public.resultados_normalizar();

-- 4) Panel docente: devuelve nombre, grupo y resultados de todos los alumnos. SIN correos.
--    Solo funciona si quien pide tiene rol 'docente'.
create or replace function public.panel_docente()
returns table (alumno_id uuid, nombre text, grupo text, nivel text, puntaje int, total int, detalle jsonb, fecha timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and rol = 'docente') then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  return query
    select p.id, p.full_name, g.nombre, r.nivel, r.puntaje, r.total, r.detalle, r.created_at
    from public.profiles p
    left join public.grupos g on g.id = p.grupo_id
    left join public.resultados r on r.user_id = p.id
    where p.rol = 'alumno'
    order by g.nombre nulls last, p.full_name, r.created_at desc;
end $$;
revoke all on function public.panel_docente() from public, anon;
grant execute on function public.panel_docente() to authenticated;

-- 5) Borrar mi cuenta: elimina la cuenta y, por cascada, el perfil y los resultados.
create or replace function public.borrar_mi_cuenta() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'No autorizado' using errcode = '42501'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.borrar_mi_cuenta() from public, anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;

-- 6) Para dar rol de docente (solo vos, desde el SQL Editor):
-- update public.profiles set rol = 'docente'
--   where id = (select id from auth.users where email = 'correo.del.docente@ejemplo.com');
