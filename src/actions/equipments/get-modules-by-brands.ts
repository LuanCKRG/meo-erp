"use server"

import { createClient } from "@/lib/supabase/server"
import type { Equipment } from "@/lib/definitions/equipments"

async function getModulesByBrand(brandId: string): Promise<Equipment[]> {
	if (!brandId) {
		return []
	}

	try {
		const supabase = await createClient()

		// Primeiro, busca o ID do tipo 'Módulo'
		const { data: typeData, error: typeError } = await supabase.from("equipment_types").select("id").eq("name", "Módulo").single()

		if (typeError || !typeData) {
			console.error("Erro ao buscar tipo 'Módulo':", typeError)
			return []
		}

		const moduleTypeId = typeData.id

		// Agora, busca os equipamentos (módulos) da marca especificada
		const { data: modules, error: modulesError } = await supabase.from("equipment").select("*").eq("brand_id", brandId).eq("type_id", moduleTypeId)

		if (modulesError) {
			console.error("Erro ao buscar módulos por marca:", modulesError)
			return []
		}

		return modules || []
	} catch (error) {
		console.error("Erro inesperado na action 'getModulesByBrand':", error)
		return []
	}
}

export default getModulesByBrand
