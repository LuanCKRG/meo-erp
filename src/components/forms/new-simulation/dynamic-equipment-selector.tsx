"use client"

import { useQuery } from "@tanstack/react-query"
import * as React from "react"
import { useFormContext } from "react-hook-form"

import { getBrandsByEquipmentType, getEquipmentsByBrandAndType } from "@/actions/equipments"
import { CardContent } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface DynamicEquipmentSelectProps {
	equipmentTypeId: string
	formFieldName: string
	formLabel: string
}

export function DynamicEquipmentSelect({ equipmentTypeId, formFieldName, formLabel }: DynamicEquipmentSelectProps) {
	const { control, setValue } = useFormContext()
	const [selectedBrand, setSelectedBrand] = React.useState<string | null>(null)

	const { data: brands = [], isLoading: brandsLoading } = useQuery({
		queryKey: ["brands", equipmentTypeId],
		queryFn: () => getBrandsByEquipmentType(equipmentTypeId),
		staleTime: 5 * 60 * 1000 // 5 minutos
	})

	const hasNoBrands = !brandsLoading && brands.length === 0

	const { data: equipments = [], isLoading: equipmentsLoading } = useQuery({
		queryKey: ["equipments", equipmentTypeId, selectedBrand],
		queryFn: () => {
			if (hasNoBrands) {
				return getEquipmentsByBrandAndType(equipmentTypeId, null)
			}
			if (selectedBrand === null) {
				return Promise.resolve([])
			}
			return getEquipmentsByBrandAndType(equipmentTypeId, selectedBrand)
		},
		enabled: !!equipmentTypeId && (hasNoBrands || selectedBrand !== null),
		staleTime: 5 * 60 * 1000
	})

	const handleBrandChange = (brandId: string | null) => {
		setSelectedBrand(brandId)
		setValue(formFieldName, "") // Reseta o equipamento ao mudar a marca
	}

	if (brandsLoading) {
		return (
			<CardContent className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
			</CardContent>
		)
	}

	return (
		<CardContent className="space-y-4">
			{!hasNoBrands && (
				<FormItem>
					<FormLabel>Marca</FormLabel>
					<Select value={selectedBrand || ""} onValueChange={handleBrandChange} disabled={brandsLoading}>
						<FormControl>
							<SelectTrigger>
								<SelectValue placeholder="Selecione uma marca" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{brands.map((brand) => (
								<SelectItem key={brand.id} value={brand.id}>
									{brand.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormItem>
			)}

			<FormField
				control={control}
				name={formFieldName}
				render={({ field }) => (
					<FormItem>
						<FormLabel>{formLabel}</FormLabel>
						{equipmentsLoading ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select
								onValueChange={field.onChange}
								value={field.value || ""}
								disabled={equipmentsLoading || (!hasNoBrands && !selectedBrand) || equipments.length === 0}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue
											placeholder={
												!hasNoBrands && !selectedBrand ? "Selecione uma marca" : equipments.length === 0 ? "Nenhum disponível" : "Selecione um equipamento"
											}
										/>
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{equipments.map((equipment) => (
										<SelectItem key={equipment.cod} value={String(equipment.cod)}>
											{equipment.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						<FormMessage />
					</FormItem>
				)}
			/>
		</CardContent>
	)
}
