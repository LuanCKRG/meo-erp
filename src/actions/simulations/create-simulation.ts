"use server"

import { PostgrestError } from "@supabase/supabase-js"

import { createCustomer, deleteCustomer } from "@/actions/customers"
import { getCurrentPartnerDetails } from "@/actions/partners"
import type { SimulationData } from "@/components/forms/new-simulation/validation/new-simulation"
import type { CustomerInsert } from "@/lib/definitions/customers"
import type { SimulationInsert } from "@/lib/definitions/simulations"
import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

const parseCurrencyStringToNumber = (value: string | undefined | null): number => {
	if (!value) return 0
	const sanitizedValue = value.replace(/\./g, "").replace(",", ".")
	const numberValue = parseFloat(sanitizedValue)
	return Number.isNaN(numberValue) ? 0 : numberValue
}

async function createSimulation(data: SimulationData): Promise<ActionResponse<{ kdi: number }>> {
	const supabase = await createClient()

	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) {
		return { success: false, message: "Usuário não autenticado. Acesso negado." }
	}

	const { data: userRoleData } = await supabase.from("users").select("role").eq("id", user.id).single()
	const isPartnerRole = userRoleData?.role === "partner"

	// Busca o seller_id do parceiro logado, se for um.
	const partnerDetails = await getCurrentPartnerDetails()
	// Admins/sellers podem não ser parceiros, então sellerId pode ser null para eles.
	// A lógica de negócio decide se isso é permitido.
	// Para este caso, a verificação na página já garante que parceiros sem seller_id não cheguem aqui.
	const sellerIdForSimulation = partnerDetails?.sellerId || null

	let newlyCreatedCustomerId: string | null = null

	try {
		// Se o usuário for um parceiro, precisamos encontrar o ID do parceiro a partir do user.id
		let partnerId: string | null = null
		if (isPartnerRole) {
			const { data: partnerData } = await supabase.from("partners").select("id").eq("user_id", user.id).single()
			if (partnerData) {
				partnerId = partnerData.id
			} else {
				// Isso não deveria acontecer se o usuário tem a role 'partner'
				console.warn("Usuário com role 'partner' não encontrado na tabela 'partners'. User ID:", user.id)
			}
		}

		const customerData: CustomerInsert = {
			cnpj: data.cnpj.replace(/\D/g, ""),
			company_name: data.legalName,
			incorporation_date: data.incorporationDate.split("/").reverse().join("-"),
			annual_revenue: parseCurrencyStringToNumber(data.annualRevenue),
			contact_name: data.contactName,
			contact_phone: data.contactPhone.replace(/\D/g, ""),
			contact_email: data.contactEmail,
			postal_code: data.cep.replace(/\D/g, ""),
			street: data.street,
			number: data.number,
			complement: data.complement,
			neighborhood: data.neighborhood,
			city: data.city,
			state: data.state,
			created_by_user_id: user.id,
			// Se o usuário for um parceiro, salvamos o ID DO PARCEIRO (não do usuário)
			partner_id: partnerId
		}

		const customerResponse = await createCustomer(customerData)

		if (!customerResponse.success || !customerResponse.data) {
			return { success: false, message: `Erro ao criar cliente: ${customerResponse.message}` }
		}

		newlyCreatedCustomerId = customerResponse.data.id

		const simulationData: SimulationInsert = {
			customer_id: newlyCreatedCustomerId,
			system_power: parseCurrencyStringToNumber(data.systemPower),
			current_consumption: parseCurrencyStringToNumber(data.currentConsumption),
			energy_provider: data.energyProvider,
			structure_type: data.structureType,
			connection_voltage: data.connectionVoltage,
			kit_module_id: Number(data.kit_module),
			kit_inverter_id: Number(data.kit_inverter),
			kit_others: data.kit_others ? Number(data.kit_others) : null,
			equipment_value: parseCurrencyStringToNumber(data.equipmentValue),
			labor_value: parseCurrencyStringToNumber(data.laborValue),
			other_costs: parseCurrencyStringToNumber(data.otherCosts),
			created_by_user_id: user.id,
			seller_id: sellerIdForSimulation // Adiciona o seller_id
		}

		const { data: simulationResult, error: simulationError } = await supabase.from("simulations").insert(simulationData).select("kdi").single()

		if (simulationError) {
			throw simulationError
		}

		return {
			success: true,
			message: "Simulação criada com sucesso!",
			data: {
				kdi: simulationResult.kdi
			}
		}
	} catch (error) {
		console.error("Erro inesperado na action 'createSimulation':", error)

		if (newlyCreatedCustomerId) {
			await deleteCustomer(newlyCreatedCustomerId)
		}

		if (error instanceof PostgrestError) {
			return {
				success: false,
				message: `Ocorreu um problema de comunicação com o sistema. Código: ${error.code}`
			}
		}

		return { success: false, message: "Ocorreu um erro inesperado. A operação foi cancelada para garantir a consistência dos dados." }
	}
}

export default createSimulation
