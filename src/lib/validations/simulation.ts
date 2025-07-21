"use client"

import { z } from "zod"
import { energyProviders } from "@/lib/constants"

export const newSimulationSchema = z.object({
	// Step 1: Project Data
	systemPower: z.preprocess(
		(val) => String(val).replace(/\./g, "").replace(",", "."),
		z.coerce.number("Potência é obrigatória.").min(0, "Potência deve ser um valor positivo.")
	),
	currentConsumption: z.preprocess(
		(val) => String(val).replace(/\./g, "").replace(",", "."),
		z.coerce.number("Consumo é obrigatório.").min(0, "Consumo deve ser um valor positivo.")
	),
	energyProvider: z.union(
		energyProviders.map((v) => z.literal(v)),
		"Selecione o fornecedor de energia."
	),
	brandId: z.string().min(1, "Selecione a marca do módulo."),
	moduleId: z.string().min(1, "Selecione o nome do módulo."),

	// Step 2: Client Data
	cnpj: z
		.string()
		.min(1, "CNPJ é obrigatório.")
		.refine((value) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value), {
			message: "CNPJ inválido. Formato esperado: 00.000.000/0000-00"
		})
		.transform((val) => val.replace(/\D/g, "")),
	legalName: z.string().min(2, { message: "Razão social é obrigatória." }),
	incorporationDate: z
		.string()
		.min(1, "Data de fundação é obrigatória.")
		.refine(
			(val) => {
				if (!/^\d{2}\/\d{2}\/\d{4}$/.test(val)) return false
				const [day, month, year] = val.split("/").map(Number)
				const date = new Date(year, month - 1, day)
				return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
			},
			{
				message: "Formato de data inválido. Use DD/MM/AAAA."
			}
		),
	annualRevenue: z.preprocess(
		(val) => (String(val).trim() === "" ? undefined : val),
		z
			.string()
			.optional()
			.transform((val) => (val ? parseFloat(val.replace(/\./g, "").replace(",", ".")) : undefined))
	),
	contactName: z.string().min(3, { message: "Nome do responsável é obrigatório." }),
	contactPhone: z
		.string()
		.min(1, "Celular do responsável é obrigatório.")
		.refine((val) => val.length === 14 || val.length === 15, { message: "Número de celular inválido. Use (00) 00000-0000." }),
	contactEmail: z.string().email({ message: "Email de contato inválido." }),

	// Step 3: Installation
	cep: z
		.string()
		.min(1, "CEP é obrigatório.")
		.length(9, { message: "CEP deve conter 8 dígitos. Formato: 00000-000" })
		.transform((val) => val.replace(/\D/g, "")),
	street: z.string().min(1, { message: "Rua é obrigatória." }),
	number: z.string().min(1, { message: "Número é obrigatório." }),
	complement: z.string().optional(),
	neighborhood: z.string().min(1, { message: "Bairro é obrigatório." }),
	city: z.string().min(1, { message: "Cidade é obrigatória." }),
	state: z.string().min(1, "Estado é obrigatório.").length(2, { message: "Estado deve ter 2 caracteres." })
})

export type NewSimulationData = z.infer<typeof newSimulationSchema>
