import type { Database } from "@/lib/supabase"

export type Seller = Database["public"]["Tables"]["sellers"]["Row"]
