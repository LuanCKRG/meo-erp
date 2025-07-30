"use client"

import { z } from "zod"
import type { EquipmentType } from "@/lib/definitions/equipments"

// Schema base para um único item do kit.
// Agora ele é uma função que aceita se a seleção de equipamento é obrigatória.
const createKitSelectionSchema = (isEquipmentRequired: boolean) =>
	z.object({
		brandId: z.string().optional(),
		equipmentId: isEquipmentRequired ? z.string().min(1, "Por favor, selecione um equipamento.") : z.string().optional() // A validação é opcional se não houver equipamentos
	})

// Função que gera dinamicamente o schema para o kit
const generateKitSchema = (types: EquipmentType[] = [], disabledTypeIds: Set<string>) => {
	const kitShape = types.reduce(
		(acc, type) => {
			const typeName = type.name.toLowerCase().replace(/\s/g, "_")
			// A validação é obrigatória apenas se o tipo NÃO estiver na lista de desabilitados
			const isRequired = !disabledTypeIds.has(type.id)
			acc[typeName] = createKitSelectionSchema(isRequired)
			return acc
		},
		{} as Record<string, z.ZodTypeAny>
	)

	return z.object(kitShape)
}

// Função principal que gera o schema completo do formulário
export const generateDynamicKitFormSchema = (types: EquipmentType[] = [], disabledTypeIds: Set<string> = new Set()) =>
	z.object({
		kit: generateKitSchema(types, disabledTypeIds)
	})
