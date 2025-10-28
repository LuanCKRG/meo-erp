-- 20251028131203_create_table_groups

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by_user_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.groups is 'Grupos de usuários criados por administradores.';
comment on column public.groups.name is 'Nome identificador do grupo.';
comment on column public.groups.description is 'Descrição opcional do grupo.';
comment on column public.groups.created_by_user_id is 'Usuário que criou o grupo.';
