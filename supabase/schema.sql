-- Pegar completo en Supabase > SQL Editor > Run.

-- 1) Perfiles (nombre de cada persona; solo lo ve ella misma)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "ver mi perfil" on public.profiles for select to authenticated using (id = auth.uid());

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'full_name', ''), 80));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Resultados de las evaluaciones (cada persona ve y guarda solo los suyos)
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
