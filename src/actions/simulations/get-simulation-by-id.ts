"use server"

import type { Customer } from "@/lib/definitions/customers"
import type { Simulation } from "@/lib/definitions/simulations"
import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

// Este tipo combina os dados da simulação, do cliente e dos equipamentos do kit.
export type FullSimulationDetails = Simulation & {
	customer: Customer
	kit_module_brand_id: string | null
	kit_inverter_brand_id: string | null
	kit_others_brand_id: string | null
}

async function getSimulationById(simulationId: string): Promise<ActionResponse<FullSimulationDetails | null>> {
	if (!simulationId) {
		return { success: false, message: "ID da simulação não fornecido." }
	}

	try {
		const supabase = await createClient()

		// 1. Busca a simulação e o cliente
		const { data: simulation, error } = await supabase
			.from("simulations")
			.select(
				`
        *,
        customers(*)
      `
			)
			.eq("id", simulationId)
			.single()

		if (error) {
			console.error("Erro ao buscar detalhes da simulação:", error)
			return { success: false, message: "Simulação não encontrada ou erro ao buscar dados." }
		}

		if (!simulation.customers) {
			return { success: false, message: "Dados do cliente associado não encontrados." }
		}

		// 2. Busca os brand_ids dos equipamentos do kit em paralelo
		const [moduleRes, inverterRes, othersRes] = await Promise.all([
			simulation.kit_module_id ? supabase.from("equipments").select("brand_id").eq("id", simulation.kit_module_id).single() : Promise.resolve({ data: null }),
			simulation.kit_inverter_id
				? supabase.from("equipments").select("brand_id").eq("id", simulation.kit_inverter_id).single()
				: Promise.resolve({ data: null }),
			simulation.kit_others ? supabase.from("equipments").select("brand_id").eq("id", simulation.kit_others).single() : Promise.resolve({ data: null })
		])

		// 3. Monta o objeto final com todos os dados
		const result: FullSimulationDetails = {
			...simulation,
			customer: simulation.customers,
			kit_module_brand_id: moduleRes.data?.brand_id || null,
			kit_inverter_brand_id: inverterRes.data?.brand_id || null,
			kit_others_brand_id: othersRes.data?.brand_id || null
		}

		return {
			success: true,
			message: "Dados da simulação encontrados.",
			data: result
		}
	} catch (e) {
		console.error("Erro inesperado em getSimulationById:", e)
		return { success: false, message: "Ocorreu um erro inesperado no servidor." }
	}
}

export default getSimulationById
