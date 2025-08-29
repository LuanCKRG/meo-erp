"use server"

import { PostgrestError } from "@supabase/supabase-js"

import type { ActionResponse } from "@/types/action-response"
import type { CustomerInsert, Customer } from "@/lib/definitions/customers"
import { createClient } from "@/lib/supabase/server"

async function createCustomer(data: CustomerInsert): Promise<ActionResponse<Customer>> {
	try {
		const supabase = await createClient()

		const { data: newCustomer, error } = await supabase.from("customers").insert(data).select().single()

		if (error) {
			console.error("Erro ao criar cliente (Supabase):", error)
			if (error instanceof PostgrestError && error.code === "23505") {
				// Assumindo que pode haver uma constraint de unicidade no CNPJ no futuro
				if (error.message.includes("cnpj")) {
					return { success: false, message: "Já existe um cliente com este CNPJ." }
				}
			}
			return {
				success: false,
				message: "Erro ao criar o cliente. Por favor, tente novamente."
			}
		}

		return {
			success: true,
			message: "Cliente criado com sucesso!",
			data: newCustomer
		}
	} catch (e) {
		console.error("Erro inesperado em createCustomer:", e)
		const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro desconhecido."
		return {
			success: false,
			message: `Ocorreu um erro inesperado: ${errorMessage}`
		}
	}
}

export default createCustomer
