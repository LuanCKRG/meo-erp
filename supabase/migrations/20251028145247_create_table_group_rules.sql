-- 20251028145247_create_table_group_rules

create table public.group_rules (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups (id) on delete cascade,
  entity text not null check (entity in ('partners', 'sellers', 'customers')),
  rule_type text not null check (rule_type in ('exclude', 'include', 'read_only')),
  target_id text not null,
  created_at timestamptz not null default now()
);

comment on table public.group_rules is 'Define regras de acesso para grupos sobre entidades específicas.';
comment on column public.group_rules.entity is 'Tabela alvo da regra (partners, sellers ou customers).';
comment on column public.group_rules.rule_type is 'Tipo de regra (exclude, include, read_only).';
comment on column public.group_rules.target_id is 'ID da entidade afetada pela regra.';
