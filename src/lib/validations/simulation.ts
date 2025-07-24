"use client"

import { z } from "zod"
import { brazilianStates, energyProviders } from "@/lib/constants"

const validStates = brazilianStates.map((state) => state.value) as [string, ...string[]]

export const newSimulationSchema = z.object({
	// Step 1: Project Data
	systemPower: z.string("Potência é obrigatória.").min(1, "Potência é obrigatória."),
	currentConsumption: z.string("Consumo é obrigatório.").min(1, "Consumo é obrigatório."),
	energyProvider: z.enum(energyProviders as [string, ...string[]], "Selecione uma concessionária válida."),

	// Step 2: Client Data
	cnpj: z
		.string("CNPJ é obrigatório.")
		.min(1, "CNPJ é obrigatório.")
		.refine((value) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value), "CNPJ inválido. Formato esperado: 00.000.000/0000-00")
		.transform((val) => val.replace(/\D/g, "")),
	legalName: z.string("Razão social é obrigatória.").min(2, "Razão social é obrigatória."),
	incorporationDate: z
		.string("Data de fundação é obrigatória.")
		.min(1, "Data de fundação é obrigatória.")
		.refine((val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val), "Formato de data inválido. Use DD/MM/AAAA."),
	annualRevenue: z.string().optional(),
	contactName: z.string("Nome do responsável é obrigatório.").min(3, "Nome do responsável é obrigatório."),
	contactPhone: z
		.string("Celular do responsável é obrigatório.")
		.min(1, "Celular do responsável é obrigatório.")
		.refine((val) => val.length === 14 || val.length === 15, "Número de celular inválido. Use (00) 00000-0000."),
	contactEmail: z.email("Email de contato inválido."),

	// Step 3: Installation
	cep: z
		.string("CEP é obrigatório.")
		.min(1, "CEP é obrigatório.")
		.length(9, "CEP deve conter 8 dígitos. Formato: 00000-000")
		.transform((val) => val.replace(/\D/g, "")),
	street: z.string("Rua é obrigatória.").min(1, "Rua é obrigatória."),
	number: z.string("Número é obrigatório.").min(1, "Número é obrigatório."),
	complement: z.string().optional(),
	neighborhood: z.string("Bairro é obrigatório.").min(1, "Bairro é obrigatório."),
	city: z.string("Cidade é obrigatória.").min(1, "Cidade é obrigatória."),
	state: z.enum(validStates, "Selecione um estado válido.")
})

export type NewSimulationData = z.infer<typeof newSimulationSchema>
