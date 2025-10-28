-- 20251028154227_add_policy_group_based_simulations

-- Habilita RLS (se ainda não estiver)
alter table public.simulations enable row level security;

-- Substitui a policy anterior por uma versão com casts consistentes
drop policy if exists "group_based_access_to_simulations" on public.simulations;

create policy "group_based_access_to_simulations"
on public.simulations
for select
using (
  -- 🚫 nenhuma regra de exclusão dos grupos do usuário pode se aplicar
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
  -- 🧩 se houver includes, vira whitelist; se não houver, acesso normal
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
);
