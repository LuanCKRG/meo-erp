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
          state,
          partners ( contact_name, legal_business_name )
        ),
        sellers (
          name
        ),
				service_fee,
				created_by:created_by_user_id ( name )
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
			const subtotal = (sim.equipment_value || 0) + (sim.labor_value || 0) + (sim.other_costs || 0)
			const total_value = subtotal + subtotal * (sim.service_fee / 100)
			const partner = Array.isArray(sim.customers.partners) ? sim.customers.partners[0] : sim.customers.partners

			return {
				id: sim.id,
				customerId: sim.customers.id,
				kdi: sim.kdi,
				cnpj: sim.customers.cnpj || "N/A",
				company_name: sim.customers.company_name || "N/A",
				city: sim.customers.city || "N/A",
				state: sim.customers.state || "N/A",
				partner_name: partner?.legal_business_name || "N/A",
				internal_manager: sim.sellers?.name || null, // Adiciona o nome do gestor interno
				system_power: sim.system_power,
				total_value,
				status: sim.status, // Adiciona o status
				created_at: sim.created_at,
				created_by_user: sim.created_by.name || "N/A"
			}
		})

		return mappedData.filter((d): d is SimulationWithRelations => d !== null)
	} catch (error) {
		console.error("Erro inesperado em getAllSimulations:", error)
		return []
	}
}

export default getAllSimulations
