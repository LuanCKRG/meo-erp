"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { getBrandsByEquipmentType, getEquipmentsByBrandAndType, getEquipmentTypes } from "@/actions/equipments"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { EquipmentType } from "@/lib/definitions/equipments"
import { generateDynamicKitFormSchema } from "@/lib/validations/hiroshima"

type DynamicKitFormValues = z.infer<ReturnType<typeof generateDynamicKitFormSchema>>

// Componente para um único conjunto de selects de equipamento
function EquipmentSelector({ type, onDisabledChange }: { type: EquipmentType; onDisabledChange: (typeId: string, isDisabled: boolean) => void }) {
	const { control, setValue, watch } = useFormContext<DynamicKitFormValues>()

	const typeName = type.name.toLowerCase().replace(/\s/g, "_")
	const watchedBrandId = watch(`kit.${typeName}.brandId`)

	const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
		queryKey: ["brands", type.id],
		queryFn: () => getBrandsByEquipmentType(type.id)
	})

	const showBrandSelect = !isLoadingBrands && brands.length > 0

	const { data: equipments = [], isLoading: isLoadingEquipments } = useQuery({
		queryKey: ["equipments", type.id, watchedBrandId],
		queryFn: () => getEquipmentsByBrandAndType(type.id, watchedBrandId || null),
		enabled: !!type.id && (!showBrandSelect || !!watchedBrandId)
	})

	// Lógica para avisar sobre marcas sem equipamentos
	React.useEffect(() => {
		if (showBrandSelect && watchedBrandId && !isLoadingEquipments && equipments?.length === 0) {
			toast.info("Nenhum equipamento encontrado", {
				description: "Não há equipamentos disponíveis para a marca selecionada."
			})
		}
	}, [equipments, isLoadingEquipments, showBrandSelect, watchedBrandId])

	const noEquipmentsForType = !showBrandSelect && !isLoadingEquipments && equipments?.length === 0
	const noEquipmentsForBrand = showBrandSelect && !!watchedBrandId && !isLoadingEquipments && equipments?.length === 0
	const isEquipmentSelectDisabled = isLoadingEquipments || (showBrandSelect && !watchedBrandId) || noEquipmentsForType || noEquipmentsForBrand

	// Informa o componente pai se este seletor está desabilitado
	React.useEffect(() => {
		onDisabledChange(type.id, isEquipmentSelectDisabled)
	}, [isEquipmentSelectDisabled, onDisabledChange, type.id])

	return (
		<div key={type.id} className="p-4 border rounded-md space-y-4">
			<h3 className="font-semibold text-lg">{type.name}</h3>

			{showBrandSelect && (
				<FormField
					control={control}
					name={`kit.${typeName}.brandId`}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Marca</FormLabel>
							<Select
								onValueChange={(value) => {
									field.onChange(value)
									const equipmentField = `kit.${typeName}.equipmentId` as const
									setValue(equipmentField, "")
								}}
								value={field.value || ""}
								disabled={isLoadingBrands}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={isLoadingBrands ? "Carregando marcas..." : "Selecione a marca"} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{brands?.map((brand) => (
										<SelectItem key={brand.id} value={brand.id}>
											{brand.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			<FormField
				control={control}
				name={`kit.${typeName}.equipmentId`}
				render={({ field }) => (
					<FormItem>
						<FormLabel>Equipamento</FormLabel>
						<Select onValueChange={field.onChange} value={field.value || ""} disabled={isEquipmentSelectDisabled}>
							<FormControl>
								<SelectTrigger>
									<SelectValue
										placeholder={
											isLoadingEquipments
												? "Carregando equipamentos..."
												: showBrandSelect && !watchedBrandId
													? "Selecione uma marca primeiro"
													: isEquipmentSelectDisabled
														? "Nenhum equipamento disponível"
														: "Selecione o equipamento"
										}
									/>
								</SelectTrigger>
							</FormControl>
							<SelectContent>
								{equipments?.map((equipment) => (
									<SelectItem key={equipment.cod} value={String(equipment.cod)}>
										{equipment.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{noEquipmentsForType && <FormDescription className="text-destructive">Não há equipamentos disponíveis para esta categoria.</FormDescription>}
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}

export function DynamicKitForm() {
	const { data: equipmentTypes = [], isLoading: isLoadingTypes } = useQuery({
		queryKey: ["equipmentTypes"],
		queryFn: getEquipmentTypes
	})

	const [disabledSelectors, setDisabledSelectors] = React.useState<Set<string>>(new Set())

	// Callback para que os seletores filhos informem seu estado
	const handleDisabledChange = React.useCallback((typeId: string, isDisabled: boolean) => {
		setDisabledSelectors((prev) => {
			const newSet = new Set(prev)
			if (isDisabled) {
				newSet.add(typeId)
			} else {
				newSet.delete(typeId)
			}
			return newSet
		})
	}, [])

	const formSchema = React.useMemo(() => generateDynamicKitFormSchema(equipmentTypes, disabledSelectors), [equipmentTypes, disabledSelectors])

	const defaultValues = React.useMemo(() => {
		return {
			kit: equipmentTypes.reduce(
				(acc, type) => {
					const typeName = type.name.toLowerCase().replace(/\s/g, "_")
					acc[typeName] = { brandId: "", equipmentId: "" }
					return acc
				},
				{} as Record<string, { brandId: string; equipmentId: string }>
			)
		}
	}, [equipmentTypes])

	const form = useForm<DynamicKitFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: defaultValues,
		mode: "onSubmit"
	})

	function onSubmit(data: DynamicKitFormValues) {
		toast.success("Formulário enviado com sucesso!", {
			description: (
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			)
		})
	}

	if (isLoadingTypes) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-24 w-full rounded-md" />
				<Skeleton className="h-10 w-48 rounded-md" />
			</div>
		)
	}

	return (
		<FormProvider {...form}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{equipmentTypes.map((type) => (
						<EquipmentSelector key={type.id} type={type} onDisabledChange={handleDisabledChange} />
					))}
					<Button type="submit" disabled={form.formState.isSubmitting || isLoadingTypes}>
						{(form.formState.isSubmitting || isLoadingTypes) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Enviar Formulário de Teste
					</Button>
				</form>
			</Form>
		</FormProvider>
	)
}
