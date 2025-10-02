"use server"

import { revalidatePath } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ActionResponse } from "@/types/action-response"

interface UpdateRateParams {
	rateId: "interest_rate" | "service_fee"
	value: number
	orderId: string
}

async function updateRateUnique({ rateId, value, orderId }: UpdateRateParams): Promise<ActionResponse<null>> {
	try {
		const supabase = createAdminClient()
		const { error } = await supabase
			.from("orders")
			.update({ [rateId]: value })
			.eq("id", orderId)

		if (error) {
			console.error(`Error updating ${rateId}:`, error)
			return { success: false, message: `Não foi possível atualizar a taxa "${rateId}".` }
		}

		revalidatePath("/dashboard/admin/settings")
		return { success: true, message: "Taxa atualizada com sucesso!", data: null }
	} catch (e) {
		console.error(`Unexpected error in updateRate for ${rateId}:`, e)
		return { success: false, message: "Ocorreu um erro inesperado." }
	}
}

export default updateRateUnique
