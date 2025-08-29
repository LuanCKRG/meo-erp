"use server"

import type { SimulationWithRelations } from "@/lib/definitions/simulations"
import { createClient } from "@/lib/supabase/server"

async function getAllSimulations(): Promise<SimulationWithRelations[]> {
	try {
		const supabase = await createClient()

		const { data, error } = await supabase
			.from("simulations")
			.select(
				`
        id,
        kdi,
        system_power,
        equipment_value,
        labor_value,
        other_costs,
        created_at,
        status,
        customers (
          id,
          cnpj,
          company_name,
          city,
          state
        ),
        users (
          name
        ),
        sellers (
          name
        )
      `
			)
			.order("created_at", { ascending: false })

		if (error) {
			console.error("Erro ao buscar simulações com detalhes:", error)
			return []
		}

		// Mapeia os dados para a estrutura final, incluindo o cálculo do valor total
		const mappedData = data.map((sim) => {
			if (!sim.customers) {
				return null // Se não houver cliente, não podemos processar esta simulação
			}
			const total_value = (sim.equipment_value || 0) + (sim.labor_value || 0) + (sim.other_costs || 0)

			return {
				id: sim.id,
				customerId: sim.customers.id,
				kdi: sim.kdi,
				cnpj: sim.customers.cnpj || "N/A",
				company_name: sim.customers.company_name || "N/A",
				city: sim.customers.city || "N/A",
				state: sim.customers.state || "N/A",
				partner_name: sim.users?.name || "N/A",
				internal_manager: sim.sellers?.name || null, // Adiciona o nome do gestor interno
				system_power: sim.system_power,
				total_value,
				status: sim.status, // Adiciona o status
				created_at: sim.created_at
			}
		})

		return mappedData.filter((d): d is SimulationWithRelations => d !== null)
	} catch (error) {
		console.error("Erro inesperado em getAllSimulations:", error)
		return []
	}
}

export default getAllSimulations
