alter table public.simulations enable row level security;

drop policy if exists "group_based_access_to_simulations" on public.simulations;

create policy "group_based_access_to_simulations"
on public.simulations
for select
using (
  -- 1) NENHUM EXCLUDE aplicável
  not exists (
    select 1
    from public.group_rules gr
    join public.group_members gm on gm.group_id = gr.group_id
    join public.customers c on c.id = simulations.customer_id
    where gm.user_id = auth.uid()
      and (
        (gr.entity = 'partners'  and gr.rule_type = 'exclude' and gr.target_id = c.partner_id::text) or
        (gr.entity = 'sellers'   and gr.rule_type = 'exclude' and gr.target_id = simulations.seller_id::text) or
        (gr.entity = 'customers' and gr.rule_type = 'exclude' and gr.target_id = simulations.customer_id::text)
      )
  )

  -- 2) WHITELIST por SIMULATIONS (se houver)
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
        and gr3.target_id = simulations.id::text
    )
  )

  -- 3) **NOVO**: WHITELIST por PARTNERS (se houver)
  and (
    not exists (
      select 1
      from public.group_rules gri
      join public.group_members gmi on gmi.group_id = gri.group_id
      where gmi.user_id = auth.uid()
        and gri.entity = 'partners'
        and gri.rule_type = 'include'
    )
    or exists (
      select 1
      from public.group_rules gri2
      join public.group_members gmi2 on gmi2.group_id = gri2.group_id
      join public.customers c2 on c2.id = simulations.customer_id
      where gmi2.user_id = auth.uid()
        and gri2.entity = 'partners'
        and gri2.rule_type = 'include'
        and gri2.target_id = c2.partner_id::text
    )
  )
);
