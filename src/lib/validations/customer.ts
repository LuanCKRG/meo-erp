"use client"

import { z } from "zod"
import { brazilianStates } from "@/lib/constants"

const stateValues = brazilianStates.map((s) => s.value) as [string, ...string[]]

// Schema que representa os dados DO FORMULÁRIO (VISÃO)
// Os valores aqui são strings, como o usuário os vê e digita.
export const editCustomerFormSchema = z.object({
	company_name: z.string().min(2, "Razão social deve ter no mínimo 2 caracteres."),
	incorporation_date: z
		.string()
		.min(10, "Data de fundação é obrigatória.")
		.refine((val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val), "Formato de data inválido. Use DD/MM/AAAA."),
	annual_revenue: z.string().optional(),
	contact_name: z.string().min(3, "Nome do responsável deve ter no mínimo 3 caracteres."),
	contact_phone: z.string().refine((val) => val.length === 14 || val.length === 15, "Celular inválido. Use (00) 00000-0000 ou (00) 0000-0000"),
	contact_email: z.email("Por favor, insira um email válido."),
	postal_code: z.string().length(9, "CEP deve conter 8 dígitos. Formato: 00000-000"),
	street: z.string().min(1, "Rua é obrigatória."),
	number: z.string().min(1, "Número é obrigatório."),
	complement: z.string().optional(),
	neighborhood: z.string().min(1, "Bairro é obrigatório."),
	city: z.string().min(1, "Cidade é obrigatória."),
	state: z.enum(stateValues, "Selecione um estado válido.")
})

// Este é o tipo dos dados que o formulário manipula (VISÃO)
export type EditCustomerFormData = z.infer<typeof editCustomerFormSchema>

// Helper que transforma a string de moeda para um número ou null.
const parseCurrency = (value: string | undefined): number | null => {
	if (!value || value.trim() === "") return null
	const numberValue = parseFloat(value.replace(/\./g, "").replace(",", "."))
	return isNaN(numberValue) ? null : numberValue
}

// Este schema TRANSFORMA os dados do formulário para o formato do banco de dados (MODELO)
// É usado antes de enviar para a action.
export const editCustomerSchema = editCustomerFormSchema.transform((data) => ({
	...data,
	incorporation_date: data.incorporation_date.split("/").reverse().join("-"), // Converte DD/MM/YYYY para YYYY-MM-DD
	annual_revenue: parseCurrency(data.annual_revenue),
	contact_phone: data.contact_phone.replace(/\D/g, ""),
	postal_code: data.postal_code.replace(/\D/g, "")
}))

// Este é o tipo que a action updateCustomer espera
export type EditCustomerData = z.infer<typeof editCustomerSchema>
