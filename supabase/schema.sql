-- Pegar completo en Supabase > SQL Editor > Run.

-- 1) Perfiles (el nombre completo es privado; solo se publica el nombre abreviado)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  display_name text not null default 'Participante',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "ver mi perfil" on public.profiles for select to authenticated using (id = auth.uid());

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, display_name)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', ''),
          left(coalesce(new.raw_user_meta_data->>'display_name', 'Participante'), 40));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Resultados de las evaluaciones
create table public.resultados (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nivel text not null check (nivel in ('nivel-1','nivel-2','nivel-3')),
  puntaje int not null check (puntaje >= 0),
  total int not null check (total > 0 and total <= 50),
  created_at timestamptz not null default now(),
  check (puntaje <= total)
);
create index on public.resultados (user_id);
alter table public.resultados enable row level security;
create policy "guardar mis resultados" on public.resultados for insert to authenticated with check (user_id = auth.uid());
create policy "ver mis resultados" on public.resultados for select to authenticated using (user_id = auth.uid());

-- 3) Tabla pública de concursantes: solo nombre abreviado y mejor puntaje por nivel
create view public.tabla_concursantes as
select distinct on (r.user_id, r.nivel)
       p.display_name as nombre, r.nivel, r.puntaje, r.total, r.created_at
from public.resultados r
join public.profiles p on p.id = r.user_id
order by r.user_id, r.nivel, r.puntaje desc, r.created_at asc;
grant select on public.tabla_concursantes to anon, authenticated;
