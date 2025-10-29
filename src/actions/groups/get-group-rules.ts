"use server"

import type { GroupRule } from "@/lib/definitions/groups"
import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

export default async function getGroupRulesAction(groupId: string): Promise<ActionResponse<GroupRule[]>> {
	try {
		const supabase = await createClient()

		const { data, error } = await supabase
			.from("group_rules")
			.select("id, entity, rule_type, target_id, created_at")
			.eq("group_id", groupId)
			.order("created_at", { ascending: false })

		if (error) {
			return {
				success: false,
				message: error.message
			}
		}

		return {
			success: true,
			message: "Regras carregadas com sucesso",
			data: (data ?? []) as GroupRule[]
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Erro ao buscar regras do grupo"
		return {
			success: false,
			message
		}
	}
}
