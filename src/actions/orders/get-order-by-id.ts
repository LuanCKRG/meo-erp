"use server"

import type { Customer } from "@/lib/definitions/customers"
import type { Order } from "@/lib/definitions/orders"
import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

// Este tipo combina os dados do pedido, do cliente e dos equipamentos do kit.
export type FullOrderDetails = Order & {
	customer: Customer
	kit_module_brand_id: string | null
	kit_inverter_brand_id: string | null
	kit_others_brand_id: string | null
}

async function getOrderById(orderId: string): Promise<ActionResponse<FullOrderDetails | null>> {
	if (!orderId) {
		return { success: false, message: "ID do pedido não fornecido." }
	}

	try {
		const supabase = await createClient()

		// 1. Busca o pedido e o cliente
		const { data: order, error } = await supabase
			.from("orders")
			.select(
				`
        *,
        customers(*)
      `
			)
			.eq("id", orderId)
			.single()

		if (error) {
			console.error("Erro ao buscar detalhes do pedido:", error)
			return { success: false, message: "Pedido não encontrado ou erro ao buscar dados." }
		}

		if (!order.customers) {
			return { success: false, message: "Dados do cliente associado não encontrados." }
		}

		// 2. Busca os brand_ids dos equipamentos do kit em paralelo
		const [moduleRes, inverterRes, othersRes] = await Promise.all([
			order.kit_module_id ? supabase.from("equipments").select("brand_id").eq("id", order.kit_module_id).single() : Promise.resolve({ data: null }),
			order.kit_inverter_id ? supabase.from("equipments").select("brand_id").eq("id", order.kit_inverter_id).single() : Promise.resolve({ data: null }),
			order.kit_others ? supabase.from("equipments").select("brand_id").eq("id", order.kit_others).single() : Promise.resolve({ data: null })
		])

		// 3. Monta o objeto final com todos os dados
		const result: FullOrderDetails = {
			...order,
			customer: order.customers,
			kit_module_brand_id: moduleRes.data?.brand_id || null,
			kit_inverter_brand_id: inverterRes.data?.brand_id || null,
			kit_others_brand_id: othersRes.data?.brand_id || null
		}

		return {
			success: true,
			message: "Dados do pedido encontrados.",
			data: result
		}
	} catch (e) {
		console.error("Erro inesperado em getOrderById:", e)
		return { success: false, message: "Ocorreu um erro inesperado no servidor." }
	}
}

export default getOrderById
