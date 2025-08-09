"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"

import { getStructureTypes } from "@/actions/equipments"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useSimulation } from "@/contexts/simulation-context"
import { connectionVoltageTypes, energyProviders, INVERTER_TYPE_ID, MODULE_TYPE_ID, OTHERS_TYPE_ID } from "@/lib/constants"
import { maskNumber } from "@/lib/masks"
import { simulationStep1Schema, type SimulationStep1Data } from "./validation/new-simulation"
import { DynamicEquipmentSelect } from "./dynamic-equipment-selector"

const SimulationStep1 = () => {
	const { simulationData, setSimulationData, nextStep } = useSimulation()

	const form = useForm<SimulationStep1Data>({
		resolver: zodResolver(simulationStep1Schema),
		defaultValues: {
			systemPower: simulationData.systemPower || "",
			currentConsumption: simulationData.currentConsumption || "",
			energyProvider: simulationData.energyProvider,
			structureType: simulationData.structureType || "",
			connectionVoltage: simulationData.connectionVoltage,
			kit_module: simulationData.kit_module || "",
			kit_inverter: simulationData.kit_inverter || "",
			kit_others: simulationData.kit_others || ""
		}
	})

	const { data: structureTypes, isLoading: isLoadingStructureTypes } = useQuery({
		queryKey: ["structureTypes"],
		queryFn: getStructureTypes
	})

	function onSubmit(data: SimulationStep1Data) {
		setSimulationData(data)
		nextStep()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<h3 className="text-lg font-medium">Passo 1: Dados do Projeto</h3>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={form.control}
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
						control={form.control}
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
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					<FormField
						control={form.control}
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
						control={form.control}
						name="structureType"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Tipo de Estrutura *</FormLabel>
								{isLoadingStructureTypes ? (
									<Skeleton className="h-10 w-full" />
								) : (
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
								)}
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
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

				<div className="flex justify-end pt-8">
					<Button type="submit">
						Próximo <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</form>
		</Form>
	)
}

export { SimulationStep1 }
