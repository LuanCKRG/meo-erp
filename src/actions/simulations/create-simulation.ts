// src/actions/simulations/create-simulation.ts
"use server"

import { PostgrestError } from "@supabase/supabase-js"

import { createCustomer, deleteCustomer, getCustomerByCnpj } from "@/actions/customers"
import { getRate } from "@/actions/settings"
import { uploadSimulationFiles } from "@/actions/simulations"
import type { SimulationData } from "@/components/forms/new-simulation/validation/new-simulation"
import type { CustomerInsert } from "@/lib/definitions/customers"
import type { SimulationInsert } from "@/lib/definitions/simulations"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

const parseCurrencyStringToNumber = (value: string | undefined | null): number => {
	if (!value) return 0
	const sanitizedValue = value.replace(/\./g, "").replace(",", ".")
	const numberValue = parseFloat(sanitizedValue)
	return Number.isNaN(numberValue) ? 0 : numberValue
}

interface SimulationContext {
	partnerId: string | null // Ajustado para aceitar null
	sellerId: string | null
}

// A action agora também aceita os dados dos arquivos.
async function createSimulation(data: SimulationData, context: SimulationContext): Promise<ActionResponse<{ kdi: number }>> {
	// Cliente padrão (usuário) para obter a sessão
	const supabase = await createClient()
	// Cliente com privilégios de admin para operações no DB
	const supabaseAdmin = createAdminClient()

	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) {
		return { success: false, message: "Usuário não autenticado. Acesso negado." }
	}

	if (!context.partnerId) {
		return { success: false, message: "ID do Parceiro não fornecido. A simulação não pode ser criada." }
	}

	let customerId: string | null = null
	let wasCustomerNewlyCreated = false
	let simulationId: string | null = null

	try {
		const cleanedCnpj = data.cnpj.replace(/\D/g, "")
		const existingCustomerResponse = await getCustomerByCnpj(cleanedCnpj)

		if (!existingCustomerResponse.success) {
			return { success: false, message: existingCustomerResponse.message }
		}

		if (existingCustomerResponse.data) {
			customerId = existingCustomerResponse.data.id
		} else {
			const customerData: CustomerInsert = {
				cnpj: cleanedCnpj,
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
				partner_id: context.partnerId,
				internal_manager: context.sellerId
			}

			const customerResponse = await createCustomer(customerData)

			if (!customerResponse.success || !customerResponse.data) {
				return { success: false, message: `Erro ao criar cliente: ${customerResponse.message}` }
			}

			customerId = customerResponse.data.id
			wasCustomerNewlyCreated = true
		}

		if (!customerId) {
			throw new Error("Não foi possível obter um ID de cliente para a simulação.")
		}

		// Busca as taxas atuais do banco de dados.
		const [interestRateRes, serviceFeeRes] = await Promise.all([getRate("interest_rate"), getRate("service_fee")])

		if (!interestRateRes.success || !serviceFeeRes.success) {
			throw new Error("Não foi possível carregar as taxas de juros e serviços para a simulação.")
		}

		// A simulação ainda não armazena os documentos, mas a action está pronta para recebê-los.
		const simulationData: SimulationInsert = {
			customer_id: customerId,
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
			seller_id: context.sellerId,
			notes: data.notes,
			interest_rate: interestRateRes.data,
			service_fee: serviceFeeRes.data
		}

		const { data: simulationResult, error: simulationError } = await supabaseAdmin.from("simulations").insert(simulationData).select("id, kdi").single()

		if (simulationError) {
			throw simulationError
		}

		simulationId = simulationResult.id

		// Upload dos arquivos
		const uploadResponse = await uploadSimulationFiles(simulationId, data)
		if (!uploadResponse.success) {
			throw new Error(`Falha no upload de arquivos: ${uploadResponse.message}`)
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

		// Ações de compensação em caso de falha
		if (simulationId) {
			await supabaseAdmin.from("simulations").delete().eq("id", simulationId)
		}
		if (wasCustomerNewlyCreated && customerId) {
			await deleteCustomer(customerId)
		}

		if (error instanceof PostgrestError) {
			return {
				success: false,
				message: `Ocorreu um problema de comunicação com o sistema. Código: ${error.code}`
			}
		}
		if (error instanceof Error) {
			return { success: false, message: error.message }
		}

		return { success: false, message: "Ocorreu um erro inesperado. A operação foi cancelada para garantir a consistência dos dados." }
	}
}

export default createSimulation
