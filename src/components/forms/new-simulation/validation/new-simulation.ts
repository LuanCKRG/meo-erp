"use client"

import { z } from "zod"
import { brazilianStates, connectionVoltageTypes, energyProviders } from "@/lib/constants"

const validStates = brazilianStates.map((state) => state.value) as [string, ...string[]]

// Helper para validação de string numérica com limite de dígitos
const numericString = (maxLength: number = 9, errorMessage: string = "Valor é obrigatório.") =>
	z
		.string(errorMessage)
		.min(1, errorMessage)
		.refine((val) => {
			const justDigits = val.replace(/\D/g, "")
			return justDigits.length <= maxLength
		}, `O valor não pode ter mais de ${maxLength} dígitos.`)

// Schema para cada passo individualmente
export const simulationStep1Schema = z.object({
	systemPower: numericString(9, "Potência é obrigatória."),
	currentConsumption: numericString(9, "Consumo é obrigatório."),
	energyProvider: z.enum(energyProviders as [string, ...string[]], "Selecione uma concessionária válida."),
	structureType: z.string().min(1, "Selecione um tipo de estrutura."),
	connectionVoltage: z.enum(connectionVoltageTypes as [string, ...string[]], "Selecione um tipo de conexão válido."),
	kit_module: z.string().min(1, "Selecione um módulo."),
	kit_inverter: z.string().min(1, "Selecione um inversor."),
	kit_others: z.string().min(1, "Selecione um item de 'Outros'.")
})

export const simulationStep2Schema = z.object({
	cnpj: z
		.string()
		.min(1, "CNPJ é obrigatório.")
		.refine((value) => /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value), "CNPJ inválido. Formato esperado: 00.000.000/0000-00")
		.transform((val) => val.replace(/\D/g, "")),
	legalName: z.string().min(2, "Razão social é obrigatória."),
	incorporationDate: z
		.string()
		.min(1, "Data de fundação é obrigatória.")
		.refine((val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val), "Formato de data inválido. Use DD/MM/AAAA."),
	annualRevenue: numericString(15).optional().or(z.literal("")),
	contactName: z.string().min(3, "Nome do responsável é obrigatório."),
	contactPhone: z
		.string()
		.min(1, "Celular do responsável é obrigatório.")
		.refine((val) => val.length === 14 || val.length === 15, "Número de celular inválido. Use (00) 00000-0000."),
	contactEmail: z.email("Email de contato inválido.")
})

export const simulationStep3Schema = z.object({
	cep: z
		.string()
		.min(1, "CEP é obrigatório.")
		.length(9, "CEP deve conter 8 dígitos. Formato: 00000-000")
		.transform((val) => val.replace(/\D/g, "")),
	street: z.string().min(1, "Rua é obrigatória."),
	number: z.string().min(1, "Número é obrigatório."),
	complement: z.string().optional(),
	neighborhood: z.string().min(1, "Bairro é obrigatório."),
	city: z.string().min(1, "Cidade é obrigatória."),
	state: z.enum(validStates, "Selecione um estado válido.")
})

export const simulationStep4Schema = z.object({
	equipmentValue: numericString(14, "Valor dos equipamentos é obrigatório."),
	laborValue: numericString(14, "Valor da mão de obra é obrigatório."),
	otherCosts: numericString(14, "Outros custos são obrigatórios.")
})

// Schema completo combinando as 'shapes' de todos os steps
export const newSimulationSchema = z.object({
	...simulationStep1Schema.shape,
	...simulationStep2Schema.shape,
	...simulationStep3Schema.shape,
	...simulationStep4Schema.shape
})

export type NewSimulationData = z.infer<typeof newSimulationSchema>
