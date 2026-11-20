-- MIGRACIÓN 3 — ejecutar UNA vez en Supabase > SQL Editor.
-- Permite guardar los resultados de las evaluaciones de Herramientas Digitales (Clase 1 y Clase 2).
-- Sin esto, "Guardar mi resultado" falla en esas clases porque la tabla solo aceptaba nivel-1, nivel-2 y nivel-3.
alter table public.resultados drop constraint if exists resultados_nivel_check;
alter table public.resultados add constraint resultados_nivel_check
  check (nivel in ('nivel-1','nivel-2','nivel-3','herramientas-clase-1','herramientas-clase-2'));
