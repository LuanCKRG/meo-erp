-- 20251028131554_create_table_group_members

create table public.group_members (
  group_id uuid references public.groups (id) on delete cascade,
  user_id uuid references public.users (id) on delete cascade,
  role text check (role in ('member', 'manager', 'viewer')) default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

comment on table public.group_members is 'Associa usuários aos grupos e define seu papel dentro do grupo.';
comment on column public.group_members.role is 'Função do usuário dentro do grupo (member, manager, viewer).';
