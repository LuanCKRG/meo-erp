"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ActionResponse } from "@/types/action-response"

async function getRate(rateId: "interest_rate" | "service_fee"): Promise<ActionResponse<number>> {
	try {
		const supabase = createAdminClient()
		const { data, error } = await supabase.from("rates").select("value").eq("id", rateId).single()

		if (error || !data) {
			console.error(`Error fetching ${rateId}:`, error)
			return { success: false, message: `Taxa "${rateId}" não encontrada.` }
		}

		return { success: true, message: "Taxa carregada.", data: data.value }
	} catch (e) {
		console.error(`Unexpected error in getRate for ${rateId}:`, e)
		return { success: false, message: "Ocorreu um erro inesperado." }
	}
}

export default getRate
