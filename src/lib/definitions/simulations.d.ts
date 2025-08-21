import type { Database } from "@/lib/definitions/supabase"

export type Simulation = Database["public"]["Tables"]["simulations"]["Row"]
export type SimulationInsert = Database["public"]["Tables"]["simulations"]["Insert"]
