"use server"

import type { EquipmentBrand } from "@/lib/definitions/equipments"
import { createClient } from "@/lib/supabase/server"

// Retorna apenas as marcas que possuem módulos (equipment_type = 'Módulo') associados.
async function getEquipmentBrands(): Promise<EquipmentBrand[]> {
	try {
		const supabase = await createClient()

		// 1. Obter o ID do tipo de equipamento 'Módulo'
		const { data: moduleType, error: typeError } = await supabase.from("equipment_types").select("id").eq("name", "MODULO").single()

		if (typeError || !moduleType) {
			console.error("Erro ao buscar o tipo de equipamento 'Módulo':", typeError)
			return []
		}

		// 2. Buscar as marcas que têm equipamentos com o type_id de 'Módulo'
		// A sintaxe "equipment!inner(type_id)" força um INNER JOIN,
		// garantindo que apenas marcas com equipamentos correspondentes sejam retornadas.
		// O select('id, name') garante que estamos selecionando os campos da tabela equipment_brands.
		const { data, error } = await supabase.from("equipment_brands").select("id, name, equipment!inner(type_id)").eq("equipment.type_id", moduleType.id)

		if (error) {
			console.error("Erro ao buscar marcas de equipamentos (Supabase):", error)
			return []
		}

		console.log(data)

		return data || []
	} catch (error) {
		console.error("Erro inesperado na action 'getEquipmentBrands':", error)
		return []
	}
}

export default getEquipmentBrands
