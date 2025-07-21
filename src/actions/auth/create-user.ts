"use server"

import { PostgrestError } from "@supabase/supabase-js"

import type { Database } from "@/lib/definitions/supabase"
import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

type UserInsert = Database["public"]["Tables"]["users"]["Insert"]

interface CreateUserParams extends Omit<UserInsert, "id"> {
	password: string
}

interface CreateUserOutput {
	id: string
	email: string
	role: UserInsert["role"]
}

const createUserErrorMessages: Record<string, string> = {
	emailExists: "Este e-mail já está registrado no sistema.",
	authCreationFailure: "Não foi possível criar o usuário de autenticação. Verifique os dados e tente novamente.",
	dbInsertionFailure: "Este e-mail já está registrado no sistema.", // Para a condição de corrida do Postgrest
	unexpectedError: "Ocorreu um erro inesperado durante a criação do usuário. A operação foi cancelada."
}

async function createUser(params: CreateUserParams): Promise<ActionResponse<CreateUserOutput>> {
	const supabase = await createClient()
	let newAuthUserId: string | null = null

	try {
		// 1. Pré-verificação: Verificar se o e-mail já existe na nossa tabela `public.users`
		const { data: existingUser, error: existingUserError } = await supabase.from("users").select("id").eq("email", params.email).maybeSingle()

		if (existingUserError) {
			console.error("Erro ao verificar usuário existente:", existingUserError)
			throw existingUserError
		}

		if (existingUser) {
			return { success: false, message: createUserErrorMessages.emailExists }
		}

		// 2. Criar o usuário na auth.users se não existir
		const { data: authData, error: authError } = await supabase.auth.admin.createUser({
			email: params.email,
			password: params.password,
			email_confirm: true
		})

		if (authError) {
			console.error("Erro ao criar usuário na auth:", authError)
			return { success: false, message: createUserErrorMessages.authCreationFailure }
		}

		newAuthUserId = authData.user.id

		// 3. Inserir na nossa public.users
		const { data: publicUserData, error: publicUserError } = await supabase
			.from("users")
			.insert({
				id: newAuthUserId,
				email: params.email,
				role: params.role
			})
			.select("id, email, role")
			.single()

		if (publicUserError) {
			console.error("Erro ao inserir na public.users:", publicUserError)
			if (newAuthUserId) {
				await supabase.auth.admin.deleteUser(newAuthUserId)
			}
			if (publicUserError instanceof PostgrestError && publicUserError.code === "23505") {
				return { success: false, message: createUserErrorMessages.dbInsertionFailure }
			}
			throw publicUserError
		}

		return {
			success: true,
			message: "Usuário criado com sucesso.",
			data: {
				id: publicUserData.id,
				email: publicUserData.email,
				role: publicUserData.role
			}
		}
	} catch (error) {
		console.error("Erro inesperado na action 'createUser':", error)

		if (newAuthUserId) {
			await supabase.auth.admin.deleteUser(newAuthUserId).catch(console.error)
		}

		return {
			success: false,
			message: createUserErrorMessages.unexpectedError
		}
	}
}

export default createUser
