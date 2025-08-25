"use server"

import { PostgrestError } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { EditSellerData } from "@/lib/validations/seller"
import type { ActionResponse } from "@/types/action-response"

async function updateSeller(sellerId: string, data: EditSellerData): Promise<ActionResponse<{ sellerId: string }>> {
	if (!sellerId) {
		return {
			success: false,
			message: "ID do vendedor não fornecido."
		}
	}

	try {
		const supabase = await createClient()

		// O user_id é o ID real na tabela de sellers
		const { error, count } = await supabase.from("sellers").update(data, { count: "exact" }).eq("id", sellerId)

		if (error) {
			console.error("Erro ao atualizar vendedor (Supabase):", error)

			if (error.code === "23505" && error.message.includes("sellers_cpf_key")) {
				return {
					success: false,
					message: "O CPF fornecido já está em uso por outro vendedor."
				}
			}

			return {
				success: false,
				message: `Erro ao atualizar os dados do vendedor. Por favor, tente novamente.`
			}
		}

		if (count === 0 || count === null) {
			return {
				success: false,
				message: "Nenhum vendedor encontrado com o ID fornecido. A atualização falhou."
			}
		}

		revalidatePath("/dashboard/sellers")

		return {
			success: true,
			message: "Vendedor atualizado com sucesso!",
			data: {
				sellerId
			}
		}
	} catch (error) {
		console.error("Erro inesperado na action 'updateSeller':", error)

		if (error instanceof PostgrestError) {
			return {
				success: false,
				message: `Ocorreu um problema de comunicação com o sistema. Código: ${error.code}`
			}
		}

		return {
			success: false,
			message: "Ocorreu um erro inesperado. Por favor, contate o suporte."
		}
	}
}

export default updateSeller
