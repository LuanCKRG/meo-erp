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

export function getFirstAndLastName(name: string | null | undefined): string {
	if (!name) return "N/A"
	const names = name.split(" ").filter(Boolean)
	if (names.length <= 2) return name
	return `${names[0]} ${names[names.length - 1]}`
}
