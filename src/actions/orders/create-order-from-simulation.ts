"use server"

import { PostgrestError } from "@supabase/supabase-js"

import type { OrderInsert } from "@/lib/definitions/orders"
import type { ActionResponse } from "@/types/action-response"
import { createClient } from "@/lib/supabase/server"

async function createOrderFromSimulation(simulationId: string): Promise<ActionResponse<{ orderId: string }>> {
	if (!simulationId) {
		return { success: false, message: "ID da simulação não fornecido." }
	}

	const supabase = await createClient()

	try {
		// 1. Buscar os dados completos da simulação
		const { data: simulation, error: fetchError } = await supabase.from("simulations").select("*").eq("id", simulationId).single()

		if (fetchError || !simulation) {
			console.error("Erro ao buscar simulação para criar pedido:", fetchError)
			return { success: false, message: "Não foi possível encontrar a simulação de origem." }
		}

		// 2. Preparar os dados para a nova tabela 'orders'
		// Omitimos 'id', 'kdi' e 'created_at' para que o banco gere novos valores.
		// Omitimos 'updated_at' pois será atualizado pelo banco.
		const orderData: OrderInsert = {
			connection_voltage: simulation.connection_voltage,
			created_by_user_id: simulation.created_by_user_id,
			current_consumption: simulation.current_consumption,
			customer_id: simulation.customer_id,
			energy_provider: simulation.energy_provider,
			equipment_value: simulation.equipment_value,
			kit_inverter_id: simulation.kit_inverter_id,
			kit_module_id: simulation.kit_module_id,
			kit_others: simulation.kit_others,
			labor_value: simulation.labor_value,
			other_costs: simulation.other_costs,
			seller_id: simulation.seller_id,
			status: "analysis_pending", // O status do pedido começa como pendente de análise.
			structure_type: simulation.structure_type,
			system_power: simulation.system_power,
			notes: simulation.notes // Copiando as notas da simulação para o pedido
		}

		// 3. Inserir na tabela 'orders'
		const { data: newOrder, error: insertError } = await supabase.from("orders").insert(orderData).select("id").single()

		if (insertError) {
			console.error("Erro ao criar pedido (Supabase):", insertError)
			if (insertError instanceof PostgrestError && insertError.code === "23503") {
				// Ex: customer_id não existe mais
				return { success: false, message: "Erro de referência ao criar pedido. Verifique se os dados relacionados ainda existem." }
			}
			return { success: false, message: "Ocorreu um erro no banco de dados ao tentar criar o pedido." }
		}

		return {
			success: true,
			message: `Pedido #${newOrder.id} criado com sucesso!`,
			data: {
				orderId: newOrder.id
			}
		}
	} catch (e) {
		console.error("Erro inesperado em createOrderFromSimulation:", e)
		return { success: false, message: "Ocorreu um erro inesperado no servidor." }
	}
}

export default createOrderFromSimulation
