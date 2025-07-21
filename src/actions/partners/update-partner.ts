"use server"

import { PostgrestError } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { EditPartnerData } from "@/lib/validations/partner"
import type { ActionResponse } from "@/types/action-response"

async function updatePartner(partnerId: string, data: EditPartnerData): Promise<ActionResponse<{ partnerId: string }>> {
	if (!partnerId) {
		return {
			success: false,
			message: "ID do parceiro não fornecido."
		}
	}

	try {
		const supabase = await createClient()

		const { error, count } = await supabase.from("partners").update(data, { count: "exact" }).eq("id", partnerId)

		if (error) {
			console.error("Erro ao atualizar parceiro (Supabase):", error)

			if (error.code === "23505") {
				return {
					success: false,
					message: "Os dados fornecidos (ex: CNPJ) já estão em uso por outro parceiro."
				}
			}

			return {
				success: false,
				message: `Erro ao atualizar os dados do parceiro. Por favor, tente novamente.`
			}
		}

		if (count === 0 || count === null) {
			return {
				success: false,
				message: "Nenhum parceiro encontrado com o ID fornecido. A atualização falhou."
			}
		}

		return {
			success: true,
			message: "Parceiro atualizado com sucesso!",
			data: {
				partnerId
			}
		}
	} catch (error) {
		console.error("Erro inesperado na action 'updatePartner':", error)

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

export default updatePartner
