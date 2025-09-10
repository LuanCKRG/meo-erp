"use server"

import { PostgrestError } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

import type { Customer } from "@/lib/definitions/customers"
import type { Order } from "@/lib/definitions/orders"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ActionResponse } from "@/types/action-response"
import { uploadOrderFiles } from "."
import type { EditSimulationData } from "@/components/forms/new-simulation/validation/new-simulation"

const parseCurrencyStringToNumber = (value: string | undefined | null): number => {
	if (!value) return 0
	// Removemos todos os caracteres não numéricos, exceto a vírgula
	const sanitizedValue = value.replace(/\./g, "").replace(",", ".")
	const numberValue = parseFloat(sanitizedValue)
	return Number.isNaN(numberValue) ? 0 : numberValue
}

interface UpdateOrderParams {
	orderId: string
	customerId: string
	data: EditSimulationData
}

async function updateOrder({ orderId, customerId, data }: UpdateOrderParams): Promise<ActionResponse<null>> {
	const supabase = createAdminClient()

	try {
		// 1. Atualizar os dados do cliente
		const customerData: Partial<Customer> = {
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
			state: data.state
		}

		const { error: customerError } = await supabase.from("customers").update(customerData).eq("id", customerId)

		if (customerError) {
			console.error("Erro ao atualizar cliente:", customerError)
			throw customerError
		}

		// 2. Atualizar os dados do pedido
		const orderData: Partial<Order> = {
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
			notes: data.notes
		}

		const { error: orderError } = await supabase.from("orders").update(orderData).eq("id", orderId)

		if (orderError) {
			console.error("Erro ao atualizar pedido:", orderError)
			throw orderError
		}

		// 3. Fazer upload de novos arquivos, se houver
		const uploadResponse = await uploadOrderFiles(orderId, data)
		if (!uploadResponse.success) {
			console.warn("O pedido foi atualizado, mas houve um erro no upload de novos arquivos:", uploadResponse.message)
		}

		revalidatePath("/dashboard/orders")
		revalidatePath(`/dashboard/orders/${orderId}`)

		return {
			success: true,
			message: "Pedido atualizado com sucesso!",
			data: null
		}
	} catch (error) {
		console.error("Erro inesperado em updateOrder:", error)
		if (error instanceof PostgrestError) {
			return { success: false, message: `Erro no banco de dados: ${error.message}` }
		}
		return { success: false, message: "Ocorreu um erro inesperado ao salvar as alterações." }
	}
}

export default updateOrder
