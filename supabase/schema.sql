create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "ver mi perfil" on public.profiles;
create policy "ver mi perfil" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "editar mi perfil" on public.profiles;
create policy "editar mi perfil" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Crea el perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'full_name', ''), 80))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Perfiles para usuarios que ya existían antes de correr este script
insert into public.profiles (id, full_name)
select id, left(coalesce(raw_user_meta_data->>'full_name', ''), 80) from auth.users
on conflict (id) do nothing;

-- 2) Resultados de las evaluaciones: cada persona guarda y ve solo los suyos
create table if not exists public.resultados (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nivel text not null check (nivel in ('nivel-1','nivel-2','nivel-3')),
  puntaje int not null check (puntaje >= 0),
  total int not null check (total > 0 and total <= 50),
  created_at timestamptz not null default now(),
  check (puntaje <= total)
);
create index if not exists resultados_user_id_idx on public.resultados (user_id, created_at desc);
alter table public.resultados enable row level security;

drop policy if exists "guardar mis resultados" on public.resultados;
create policy "guardar mis resultados" on public.resultados
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "ver mis resultados" on public.resultados;
create policy "ver mis resultados" on public.resultados
  for select to authenticated using (user_id = (select auth.uid()));

-- Permisos de tabla (las políticas de arriba deciden qué filas)
revoke all on public.profiles, public.resultados from anon;
grant select, update (full_name) on public.profiles to authenticated;
grant select, insert (nivel, puntaje, total) on public.resultados to authenticated;
