"use server"

import { PostgrestError } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

interface DeleteSimulationParams {
	simulationId: string
	customerId: string
}

async function deleteSimulation({ simulationId, customerId }: DeleteSimulationParams): Promise<ActionResponse<null>> {
	if (!simulationId || !customerId) {
		return { success: false, message: "ID da Simulação ou do Cliente não fornecido." }
	}

	const supabase = await createClient()

	try {
		// 1. Deletar a simulação
		// A deleção em cascata (ON DELETE CASCADE) na FK de customer_id cuidaria disso,
		// mas fazer em dois passos nos dá mais controle sobre a resposta.
		const { error: simulationError } = await supabase.from("simulations").delete().eq("id", simulationId)

		if (simulationError) {
			console.error("Erro ao deletar simulação (Supabase):", simulationError)
			throw simulationError
		}

		// 2. Deletar o cliente associado
		const { error: customerError } = await supabase.from("customers").delete().eq("id", customerId)

		if (customerError) {
			console.error("Erro ao deletar cliente associado (Supabase):", customerError)
			// A simulação foi deletada, mas o cliente não. Isso é um estado inconsistente.
			// Informamos o usuário sobre isso. Em um sistema mais complexo, isso poderia disparar um alerta.
			return {
				success: true,
				data: null,
				message: "Simulação deletada, mas houve um problema ao remover o cliente associado. Contate o suporte."
			}
		}

		revalidatePath("/dashboard/simulations")

		return {
			success: true,
			data: null,
			message: "Simulação e cliente associado foram deletados com sucesso."
		}
	} catch (error) {
		console.error("Erro inesperado em deleteSimulation:", error)
		if (error instanceof PostgrestError) {
			return { success: false, message: `Erro no banco de dados: ${error.message}` }
		}
		return { success: false, message: "Ocorreu um erro inesperado. Tente novamente." }
	}
}

export default deleteSimulation
