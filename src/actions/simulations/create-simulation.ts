"use server"

import { PostgrestError } from "@supabase/supabase-js"

import { createCustomer, deleteCustomer, getCustomerByCnpj } from "@/actions/customers"
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

interface SimulationContext {
	partnerId: string
	sellerId: string | null
}

async function createSimulation(data: SimulationData, context: SimulationContext): Promise<ActionResponse<{ kdi: number }>> {
	const supabase = await createClient()

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

	try {
		// Passo 1: Verificar se o cliente já existe
		const cleanedCnpj = data.cnpj.replace(/\D/g, "")
		const existingCustomerResponse = await getCustomerByCnpj(cleanedCnpj)

		if (!existingCustomerResponse.success) {
			// Se a própria busca falhou, retorna o erro.
			return { success: false, message: existingCustomerResponse.message }
		}

		if (existingCustomerResponse.data) {
			// Cliente já existe, usamos o ID dele.
			customerId = existingCustomerResponse.data.id
		} else {
			// Cliente não existe, criamos um novo.
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
			// Verificação de segurança, embora improvável de acontecer.
			throw new Error("Não foi possível obter um ID de cliente para a simulação.")
		}

		// Passo 2: Criar a simulação
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
			notes: data.notes
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

		// Ação de compensação: deleta o cliente apenas se ele foi criado nesta transação.
		if (wasCustomerNewlyCreated && customerId) {
			await deleteCustomer(customerId)
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
