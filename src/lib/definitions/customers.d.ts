import type { Database } from "@/lib/definitions/supabase"

export type Customer = Database["public"]["Tables"]["customers"]["Row"]
