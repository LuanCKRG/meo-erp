import type { Database } from "@/lib/supabase"

type Equipment = Database["public"]["Tables"]["equipment"]["Row"]
type EquipmentBrand = Database["public"]["Tables"]["equipment_brands"]["Row"]
type EquipmentType = Database["public"]["Tables"]["equipment_types"]["Row"]

export type { Equipment, EquipmentBrand, EquipmentType }
