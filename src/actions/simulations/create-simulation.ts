"use server"

import { PostgrestError } from "@supabase/supabase-js"

import { getCurrentUser } from "@/actions/auth"
import type { SimulationData } from "@/components/forms/new-simulation/validation/new-simulation"
import type { SimulationInsert } from "@/lib/definitions/simulations"
import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

// Remove a parte da responsabilidade de quem está chamando a action
type ProcessedData = Omit<SimulationInsert, "created_by_user_id" | "created_by_name" | "created_by_email">

// Função auxiliar para converter string formatada (ex: "1.234,56") para número
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
	const currentUser = await getCurrentUser()

	if (!user || !currentUser.name || !currentUser.email) {
		return { success: false, message: "Usuário não autenticado ou dados do usuário incompletos." }
	}

	try {
		const processedData: ProcessedData = {
			system_power: parseCurrencyStringToNumber(data.systemPower),
			current_consumption: parseCurrencyStringToNumber(data.currentConsumption),
			energy_provider: data.energyProvider,
			structure_type: data.structureType,
			connection_voltage: data.connectionVoltage,
			kit_module_id: data.kit_module,
			kit_inverter_id: data.kit_inverter,
			kit_others: data.kit_others,
			cnpj: data.cnpj.replace(/\D/g, ""),
			legal_name: data.legalName,
			incorporation_date: data.incorporationDate.split("/").reverse().join("-"),
			annual_revenue: parseCurrencyStringToNumber(data.annualRevenue),
			contact_name: data.contactName,
			contact_phone: data.contactPhone.replace(/\D/g, ""),
			contact_email: data.contactEmail,
			cep: data.cep.replace(/\D/g, ""),
			street: data.street,
			number: data.number,
			complement: data.complement,
			neighborhood: data.neighborhood,
			city: data.city,
			state: data.state,
			equipment_value: parseCurrencyStringToNumber(data.equipmentValue),
			labor_value: parseCurrencyStringToNumber(data.laborValue),
			other_costs: parseCurrencyStringToNumber(data.otherCosts)
		}

		const { data: simulationResult, error } = await supabase
			.from("simulations")
			.insert({
				...processedData,
				created_by_user_id: user.id,
				created_by_name: currentUser.name,
				created_by_email: currentUser.email
			})
			.select("kdi")
			.single()

		if (error) {
			console.error("Erro ao criar simulação (Supabase):", error)
			throw error
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
		if (error instanceof PostgrestError) {
			return {
				success: false,
				message: `Ocorreu um problema de comunicação com o sistema. Código: ${error.code}`
			}
		}
		return { success: false, message: "Ocorreu um erro inesperado ao salvar a simulação." }
	}
}

export default createSimulation
