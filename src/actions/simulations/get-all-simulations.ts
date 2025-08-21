"use server"

import type { Simulation } from "@/lib/definitions/simulations"
import { createClient } from "@/lib/supabase/server"

async function getAllSimulations(): Promise<Simulation[]> {
	try {
		const supabase = await createClient()
		const { data, error } = await supabase.from("simulations").select("*").order("created_at", { ascending: false })

		if (error) {
			console.error("Erro ao buscar simulações:", error)
			return []
		}

		return data || []
	} catch (error) {
		console.error("Erro inesperado em getAllSimulations:", error)
		return []
	}
}

export default getAllSimulations
