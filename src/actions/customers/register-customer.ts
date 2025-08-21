"use server"

import { PostgrestError } from "@supabase/supabase-js"

import { createUser } from "@/actions/auth"
import { createClient } from "@/lib/supabase/server"
import type { RegisterCustomerData } from "@/lib/validations/customer"
import type { ActionResponse } from "@/types/action-response"

const customerRegistrationErrorMessages: Record<string, string> = {
	userCreationFailed: "Não foi possível criar o usuário. Tente novamente.",
	customerInsertionFailed: "O usuário foi criado, mas não foi possível registrar os dados do cliente. A operação foi cancelada.",
	default: "Ocorreu um erro inesperado. Por favor, tente novamente."
}

async function registerCustomer(data: RegisterCustomerData): Promise<ActionResponse<{ userId: string }>> {
	const supabase = await createClient()
	let newAuthUserId: string | null = null

	try {
		// 1. Chamar a action centralizada para criar o usuário em auth.users e public.users
		const userResponse = await createUser({
			email: data.email,
			password: data.password,
			role: "client",
			name: data.name
		})

		if (!userResponse.success || !userResponse.data?.id) {
			// Propaga a mensagem de erro específica da action createUser (ex: email já existe)
			return { success: false, message: userResponse.message || customerRegistrationErrorMessages.userCreationFailed }
		}

		newAuthUserId = userResponse.data.id

		// 2. Tentar inserir os dados específicos do cliente na tabela 'customers'
		const { data: customerData, error: customerError } = await supabase
			.from("customers")
			.insert({
				id: newAuthUserId,
				name: data.name,
				email: data.email
			})
			.select("id")
			.single()

		if (customerError) {
			// Se esta inserção falhar, a ação de compensação (deletar usuário) será acionada no bloco catch
			throw customerError
		}

		return {
			success: true,
			message: "Conta de cliente criada com sucesso!",
			data: {
				userId: customerData.id
			}
		}
	} catch (error) {
		console.error("Erro no processo de registro de cliente:", error)

		// Ação de compensação: se o usuário de autenticação foi criado, mas algo deu errado depois,
		// deletamos o usuário de autenticação para manter a consistência.
		if (newAuthUserId) {
			await supabase.auth.admin.deleteUser(newAuthUserId).catch((err) => console.error("Falha ao deletar usuário órfão:", err))
		}

		if (error instanceof PostgrestError) {
			// Não esperamos um "23505" aqui, mas tratamos por segurança
			const message = customerRegistrationErrorMessages.customerInsertionFailed
			return { success: false, message }
		}

		return {
			success: false,
			message: customerRegistrationErrorMessages.default
		}
	}
}

export default registerCustomer
