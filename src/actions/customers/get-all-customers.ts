"use server"

import type { CustomerWithRelations } from "@/lib/definitions/customers"
import { createClient } from "@/lib/supabase/server"

async function getAllCustomers(): Promise<CustomerWithRelations[]> {
	try {
		const supabase = await createClient()

		const { data, error } = await supabase
			.from("customers")
			.select(
				`
        id,
        kdi,
        company_name,
        cnpj,
        partners (
          contact_name,
          sellers ( name )
        )
      `
			)
			.order("kdi", { ascending: false })

		if (error) {
			console.error("Erro ao buscar clientes com detalhes:", error)
			return []
		}

		const mappedData = data.map((customer) => {
			const partner = Array.isArray(customer.partners) ? customer.partners[0] : customer.partners

			return {
				id: customer.id,
				kdi: customer.kdi,
				company_name: customer.company_name,
				cnpj: customer.cnpj,
				partner_name: partner?.contact_name || "N/A",
				internal_manager_name: partner?.sellers?.name || "N/A"
			}
		})

		return mappedData
	} catch (error) {
		console.error("Erro inesperado em getAllCustomers:", error)
		return []
	}
}

export default getAllCustomers
