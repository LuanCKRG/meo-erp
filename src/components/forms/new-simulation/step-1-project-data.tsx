"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { connectionVoltageTypes, energyProviders } from "@/lib/constants"
import { maskNumber } from "@/lib/masks"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { DynamicEquipmentSelect } from "./dynamic-equipment-selector"
import { getStructureTypes } from "@/actions/equipments"

// IDs estáticos para os tipos de equipamento que esperamos ter no banco de dados.
const MODULE_TYPE_ID = "e070febb-6e62-480f-a398-bb02139e4d80" // Assumindo que o ID para 'Módulo Fotovoltaico' é 1
const INVERTER_TYPE_ID = "1a0c272e-0cd6-460a-a765-339cdee27c72" // Assumindo que o ID para 'Inversor' é 2
const OTHERS_TYPE_ID = "e5667c3c-7933-483a-9c2f-c015af369e33" // Assumindo que o ID para 'Estruturas' é 3

export function SimulationStep1() {
	const { control } = useFormContext()

	const { data: structureTypes, isLoading: isLoadingStructureTypes } = useQuery({
		queryKey: ["structureTypes"],
		queryFn: getStructureTypes
	})

	return (
		<div className="space-y-6">
			<h3 className="text-lg font-medium">Passo 1: Dados do Projeto</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<FormField
					control={control}
					name="systemPower"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Potência (kWp) *</FormLabel>
							<FormControl>
								<Input type="text" placeholder="9.999,99" {...field} onChange={(e) => field.onChange(maskNumber(e.target.value, 9))} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="currentConsumption"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Consumo Atual (kWh) *</FormLabel>
							<FormControl>
								<Input type="text" placeholder="9.999,99" {...field} onChange={(e) => field.onChange(maskNumber(e.target.value, 9))} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<FormField
					control={control}
					name="energyProvider"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Concessionária *</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Selecione a concessionária" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{energyProviders.map((provider) => (
										<SelectItem key={provider} value={provider}>
											{provider}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="structureType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Tipo de Estrutura *</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isLoadingStructureTypes}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={isLoadingStructureTypes ? "Carregando..." : "Selecione o tipo"} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{structureTypes?.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={control}
					name="connectionVoltage"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Conexão e Tensão *</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Selecione o tipo de conexão" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{connectionVoltageTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<Separator className="my-8" />
			<div className="space-y-2">
				<h3 className="text-lg font-medium">Kit de Equipamentos</h3>
				<p className="text-sm text-muted-foreground">Selecione os equipamentos para a simulação.</p>
			</div>
			<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Módulos</CardTitle>
					</CardHeader>
					<DynamicEquipmentSelect equipmentTypeId={MODULE_TYPE_ID} formFieldName="kit_module" formLabel="Módulo *" />
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Inversores</CardTitle>
					</CardHeader>
					<DynamicEquipmentSelect equipmentTypeId={INVERTER_TYPE_ID} formFieldName="kit_inverter" formLabel="Inversor *" />
				</Card>
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Outros</CardTitle>
					</CardHeader>
					<DynamicEquipmentSelect equipmentTypeId={OTHERS_TYPE_ID} formFieldName="kit_others" formLabel="Outros *" />
				</Card>
			</div>
		</div>
	)
}
