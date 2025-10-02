"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ActionResponse } from "@/types/action-response"

async function getRateUnique(rateId: "interest_rate" | "service_fee", orderId: string): Promise<ActionResponse<number>> {
	try {
		const supabase = createAdminClient()
		const { data, error } = await supabase.from("orders").select(`${rateId}`).eq("id", orderId).single()

		if (error || !data) {
			console.error(`Error fetching ${rateId}:`, error)
			return { success: false, message: `Taxa "${rateId}" não encontrada.` }
		}

		// Solução: Fazer type assertion ou acessar dinamicamente
		const rateValue = data[rateId as keyof typeof data] as number

		return { success: true, message: "Taxa carregada.", data: rateValue }
	} catch (e) {
		console.error(`Unexpected error in getRate for ${rateId}:`, e)
		return { success: false, message: "Ocorreu um erro inesperado." }
	}
}

export default getRateUnique
