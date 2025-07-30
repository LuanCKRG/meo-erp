"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getEquipmentTypes, getBrandsByEquipmentType, getEquipmentsByBrandAndType } from "@/actions/equipments"

// Types
type EquipmentType = {
	id: string
	name: string
}

type EquipmentBrand = {
	id: string
	name: string
}

type Equipment = {
	cod: number
	name: string
	type_id: string
	brand_id: string | null
	created_at: string
	updated_at: string
}

// Schema dinâmico baseado nos types disponíveis
const createFormSchema = (availableTypes: EquipmentType[]) => {
	const schema: Record<string, z.ZodString> = {}

	availableTypes.forEach((type) => {
		schema[`equipment_${type.id}`] = z.string().min(1, `Selecione um equipamento para ${type.name}`)
	})

	return z.object(schema)
}

// Hook personalizado para buscar brands por type
function useBrandsByType(typeId: string | null) {
	return useQuery({
		queryKey: ["brands", typeId],
		queryFn: () => (typeId ? getBrandsByEquipmentType(typeId) : Promise.resolve([])),
		enabled: !!typeId,
		staleTime: 5 * 60 * 1000 // 5 minutos
	})
}

// Hook personalizado para buscar equipments
function useEquipmentsByBrandAndType(typeId: string | null, brandId: string | null, hasNoBrands: boolean) {
	return useQuery({
		queryKey: ["equipments", typeId, brandId],
		queryFn: () => {
			if (!typeId) return Promise.resolve([])

			// Se não há brands para este type, busca equipamentos sem brand
			if (hasNoBrands) {
				return getEquipmentsByBrandAndType(typeId, null)
			}

			// Se há brands mas nenhuma foi selecionada ainda, não busca equipamentos
			if (brandId === null) {
				return Promise.resolve([])
			}

			return getEquipmentsByBrandAndType(typeId, brandId)
		},
		enabled: !!typeId && (hasNoBrands || brandId !== null),
		staleTime: 5 * 60 * 1000
	})
}

// Componente para seleção de equipamento por type
function EquipmentTypeSection({
	type,
	form,
	selectedBrand,
	onBrandChange
}: {
	type: EquipmentType
	form: any
	selectedBrand: string | null
	onBrandChange: (brandId: string | null) => void
}) {
	const { data: brands = [], isLoading: brandsLoading } = useBrandsByType(type.id)

	const hasNoBrands = !brandsLoading && brands.length === 0

	const { data: equipments = [], isLoading: equipmentsLoading } = useEquipmentsByBrandAndType(type.id, selectedBrand, hasNoBrands)

	// Se não há equipamentos nem brands, não renderiza esta seção
	if (!brandsLoading && !equipmentsLoading && brands.length === 0 && equipments.length === 0) {
		return null
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-lg">{type.name}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Select de Brand - só aparece se houver brands */}
				{!hasNoBrands && (
					<div className="space-y-2">
						{/* <label className="text-sm font-medium">Marca</label> */}
						<Select
							value={selectedBrand || ""}
							onValueChange={(value) => {
								onBrandChange(value || null)
								// Reset equipment selection when brand changes
								form.setValue(`equipment_${type.id}`, "")
							}}
							disabled={brandsLoading}
						>
							<SelectTrigger>
								<SelectValue placeholder={brandsLoading ? "Carregando marcas..." : "Selecione uma marca"} />
							</SelectTrigger>
							<SelectContent>
								{brands.map((brand) => (
									<SelectItem key={brand.id} value={brand.id}>
										{brand.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Select de Equipment */}
				<FormField
					control={form.control}
					name={`equipment_${type.id}`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Equipamento</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value}
								disabled={equipmentsLoading || (!hasNoBrands && !selectedBrand) || equipments.length === 0}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue
											placeholder={
												equipmentsLoading
													? "Carregando equipamentos..."
													: !hasNoBrands && !selectedBrand
														? "Selecione uma marca primeiro"
														: equipments.length === 0
															? "Nenhum equipamento disponível"
															: "Selecione um equipamento"
											}
										/>
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{equipments.map((equipment) => (
										<SelectItem key={equipment.cod} value={equipment.cod.toString()}>
											{equipment.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
}

// Componente principal do formulário
export default function EquipmentSelectionForm() {
	const [selectedBrands, setSelectedBrands] = useState<Record<string, string | null>>({})

	// Buscar todos os types
	const {
		data: equipmentTypes = [],
		isLoading: typesLoading,
		error
	} = useQuery({
		queryKey: ["equipment-types"],
		queryFn: getEquipmentTypes,
		staleTime: 10 * 60 * 1000 // 10 minutos
	})

	// Criar schema dinâmico baseado nos tipos disponíveis
	const formSchema = createFormSchema(equipmentTypes)
	type FormData = z.infer<typeof formSchema>

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: equipmentTypes.reduce((acc, type) => {
			acc[`equipment_${type.id}` as keyof FormData] = "" as any
			return acc
		}, {} as FormData)
	})

	const handleBrandChange = (typeId: string, brandId: string | null) => {
		setSelectedBrands((prev) => ({
			...prev,
			[typeId]: brandId
		}))
	}

	const onSubmit = (data: FormData) => {
		console.log("Dados do formulário:", data)

		// Aqui você pode processar os dados como quiser
		const selectedEquipments = Object.entries(data)
			.filter(([_, value]) => value !== "")
			.map(([key, value]) => {
				const typeId = key.replace("equipment_", "")
				const type = equipmentTypes.find((t) => t.id === typeId)
				return {
					typeId,
					typeName: type?.name,
					equipmentCod: parseInt(value as string),
					brandId: selectedBrands[typeId]
				}
			})

		console.log("Equipamentos selecionados:", selectedEquipments)
	}

	if (typesLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p>Carregando tipos de equipamentos...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="text-center p-8">
				<p className="text-red-500">Erro ao carregar tipos de equipamentos</p>
			</div>
		)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
					{equipmentTypes.map((type) => (
						<EquipmentTypeSection
							key={type.id}
							type={type}
							form={form}
							selectedBrand={selectedBrands[type.id] || null}
							onBrandChange={(brandId) => handleBrandChange(type.id, brandId)}
						/>
					))}
				</div>

				{equipmentTypes.length > 0 && (
					<div className="flex justify-end">
						<Button type="submit" className="px-8">
							Confirmar Seleção
						</Button>
					</div>
				)}

				{equipmentTypes.length === 0 && (
					<div className="text-center p-8">
						<p className="text-gray-500">Nenhum tipo de equipamento encontrado</p>
					</div>
				)}
			</form>
		</Form>
	)
}
