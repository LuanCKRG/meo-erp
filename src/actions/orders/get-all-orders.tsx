"use server"

import type { OrderWithRelations } from "@/lib/definitions/orders"
import { createClient } from "@/lib/supabase/server"

async function getAllOrders(): Promise<OrderWithRelations[]> {
	try {
		const supabase = await createClient()

		const { data, error } = await supabase
			.from("orders")
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
          partners ( contact_name )
        ),
        sellers (
          name
        )
      `
			)
			.order("created_at", { ascending: false })

		if (error) {
			console.error("Erro ao buscar pedidos com detalhes:", error)
			return []
		}

		// Mapeia os dados para a estrutura final, incluindo o cálculo do valor total
		const mappedData = data.map((order) => {
			if (!order.customers) {
				return null
			}
			const total_value = (order.equipment_value || 0) + (order.labor_value || 0) + (order.other_costs || 0)
			const partner = Array.isArray(order.customers.partners) ? order.customers.partners[0] : order.customers.partners

			return {
				id: order.id,
				customerId: order.customers.id,
				kdi: order.kdi,
				cnpj: order.customers.cnpj || "N/A",
				company_name: order.customers.company_name || "N/A",
				city: order.customers.city || "N/A",
				state: order.customers.state || "N/A",
				partner_name: partner?.contact_name || "N/A",
				internal_manager: order.sellers?.name || null,
				system_power: order.system_power,
				total_value,
				status: order.status,
				created_at: order.created_at
			}
		})

		return mappedData.filter((d): d is OrderWithRelations => d !== null)
	} catch (error) {
		console.error("Erro inesperado em getAllOrders:", error)
		return []
	}
}

export default getAllOrders
