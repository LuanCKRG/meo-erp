import type { Database } from "@/lib/definitions/supabase"

export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
export type OrderStatus = Database["public"]["Enums"]["enum_order_status"]

export type OrderWithRelations = {
	id: string
	customerId: string
	kdi: number
	cnpj: string
	company_name: string
	city: string
	state: string
	partner_name: string
	internal_manager: string | null
	system_power: number
	total_value: number
	status: OrderStatus
	created_at: string
}
