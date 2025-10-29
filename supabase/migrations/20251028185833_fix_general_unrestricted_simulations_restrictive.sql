-- 20251029_fix_general_unrestricted_simulations_restrictive.sql
-- Torna a policy "General_unrestricted_simulations" RESTRICTIVE
-- para não bypassar as políticas baseadas em grupos.

-- Garante RLS ligado
alter table public.simulations enable row level security;

-- Remove a versão permissiva (se existir)
drop policy if exists "General_unrestricted_simulations" on public.simulations;

-- Recria como RESTRICTIVE
create policy "General_unrestricted_simulations"
as restrictive
for select
to public
on public.simulations
using (
  not lower((auth.jwt() ->> 'email')::text) = any (
    array[
      'thiago.soares@credsolaris.com.br'::text,
      'daldo.nascimento@credsolaris.com.br'::text,
      'higino.cardoso@credsolaris.com.br'::text,
      'bruna.silva@credsolaris.com.br'::text,
      'julia.souza@credsolaris.com.br'::text,
      'amanda.estevam@credsolaris.com.br'::text,
      'wania.maciel@credsolaris.com.br'::text
    ]
  )
);
