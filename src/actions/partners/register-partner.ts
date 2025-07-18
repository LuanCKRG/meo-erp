"use server"

import { createClient } from "@/lib/supabase/server"
import type { RegisterPartnerData } from "@/lib/validations/partner"
import type { ActionResponse } from "@/types/action-response"

const rpcErrorMessages: Record<string, string> = {
	P0001: "Já existe um parceiro cadastrado com este CNPJ.",
	P0002: "Este e-mail já está em uso por outro parceiro.",
	P0003: "Erro ao criar o usuário de autenticação. Tente novamente mais tarde.",
	P0004: "Erro ao registrar os dados do parceiro. Tente novamente mais tarde.",
	P0005: "Erro de referência de usuário. Contate o suporte.",
	"23505": "Dados duplicados. Verifique as informações e tente novamente.", // Código genérico para violação de unicidade
	default: "Ocorreu um erro inesperado durante o cadastro. Tente novamente."
}

async function registerPartner(data: RegisterPartnerData): Promise<ActionResponse<{ userId: string; partnerId: string }>> {
	try {
		const supabase = await createClient()

		const { data: rpcData, error: rpcError } = await supabase
			.rpc("rpc_register_partner", {
				_contact_email: data.contactEmail,
				_password: data.password,
				_cnpj: data.cnpj,
				_legal_business_name: data.legalBusinessName,
				_contact_name: data.contactName,
				_contact_mobile: data.contactMobile,
				_cep: data.cep,
				_street: data.street,
				_number: data.number,
				_complement: data.complement,
				_neighborhood: data.neighborhood,
				_city: data.city,
				_state: data.state
			})
			.single()

		if (rpcError) {
			console.error("Erro na RPC 'register_partner':", rpcError)
			const errorCode = rpcError.code || "default"
			const message = rpcErrorMessages[errorCode] || rpcErrorMessages.default
			return {
				success: false,
				message
			}
		}

		if (!rpcData) {
			return {
				success: false,
				message: "Não foi possível obter os dados do novo parceiro."
			}
		}

		return {
			success: true,
			message: "Parceiro cadastrado com sucesso!",
			data: {
				userId: rpcData.user_id,
				partnerId: rpcData.partner_id
			}
		}
	} catch (error) {
		console.error("Erro inesperado na action 'registerPartner':", error)
		return {
			success: false,
			message: "Ocorreu um erro inesperado. Por favor, contate o suporte."
		}
	}
}

export default registerPartner
