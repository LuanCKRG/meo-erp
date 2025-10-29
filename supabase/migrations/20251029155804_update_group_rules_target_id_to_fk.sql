-- 20251029155804_update_group_rules_target_id_to_fk

-- Step 1: dropar policies que dependem de group_rules.target_id
drop policy if exists "group_based_access_to_simulations" on public.simulations;

-- Step 2: alterar tipo da coluna e criar FK
alter table public.group_rules
  alter column target_id type uuid using target_id::uuid;

alter table public.group_rules
  add constraint group_rules_target_id_fkey
  foreign key (target_id)
  references public.partners(id)
  on delete cascade;

-- Step 3: recriar a policy (versão simplificada)
create policy "group_based_access_to_simulations"
on public.simulations
for select
using (
  not exists (
    select 1
    from public.group_rules gr
    join public.group_members gm on gm.group_id = gr.group_id
    join public.customers c on c.id = simulations.customer_id
    where gm.user_id = auth.uid()
      and gr.rule_type = 'exclude'
      and gr.entity = 'partners'
      and gr.target_id = c.partner_id
  )
  and (
    not exists (
      select 1
      from public.group_rules gr2
      join public.group_members gm2 on gm2.group_id = gr2.group_id
      where gm2.user_id = auth.uid()
        and gr2.entity = 'simulations'
        and gr2.rule_type = 'include'
    )
    or exists (
      select 1
      from public.group_rules gr3
      join public.group_members gm3 on gm3.group_id = gr3.group_id
      where gm3.user_id = auth.uid()
        and gr3.entity = 'simulations'
        and gr3.rule_type = 'include'
        and gr3.target_id = simulations.id
    )
  )
);
