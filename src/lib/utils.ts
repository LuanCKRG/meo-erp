import { type ClassValue, clsx } from "clsx"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
	if (!dateString) return ""
	const date = new Date(dateString)
	return format(date, "dd/MM/yyyy")
}
