import type { Database } from "@/lib/definitions/supabase"

export type Customer = Database["public"]["Tables"]["customers"]["Row"]
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"]

export type CustomerWithRelations = {
	id: string
	kdi: number
	company_name: string
	cnpj: string
	partner_name: string
	internal_manager_name: string | null
	city: string | null
	state: string | null
}
