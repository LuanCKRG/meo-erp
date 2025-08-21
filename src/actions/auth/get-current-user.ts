"use server"

import { createClient } from "@/lib/supabase/server"

interface CurrentUser {
	name: string | null
	email: string | null
}

/**
 * Busca o nome e o email do usuário atualmente logado.
 * O email vem da tabela de autenticação, e o nome vem da tabela
 * correspondente à sua função (sellers, partners ou customers).
 */
async function getCurrentUser(): Promise<CurrentUser> {
	const supabase = await createClient()

	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) {
		return { name: null, email: null }
	}

	// O email está sempre disponível no objeto de usuário da autenticação.
	const email = user.email || null

	try {
		// Buscamos o perfil na nossa tabela 'users' para obter o nome diretamente.
		const { data: userProfile, error: profileError } = await supabase.from("users").select("name").eq("id", user.id).single()

		if (profileError || !userProfile) {
			console.error("Erro ao buscar perfil do usuário:", profileError?.message)
			// Fallback para usar a primeira parte do email se o perfil não for encontrado.
			const name = user.email?.split("@")[0] || "Usuário"
			return { name, email }
		}

		return { name: userProfile.name, email }
	} catch (e) {
		console.error("Erro inesperado ao buscar dados do usuário:", e)
		// Em caso de erro, retorna um nome padrão para não quebrar a UI.
		return { name: "Usuário", email }
	}
}

export default getCurrentUser
