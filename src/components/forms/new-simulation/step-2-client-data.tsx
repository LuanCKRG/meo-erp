"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSimulation } from "@/contexts/simulation-context"
import { formatCep } from "@/lib/formatters"
import { maskCnpj, maskDate, maskNumber, maskPhone } from "@/lib/masks"
import { type SimulationStep2Data, simulationStep2Schema } from "./validation/new-simulation"

const fieldsToClear = ["legalName", "incorporationDate"] as const

const SimulationStep2 = () => {
	const { simulationData, setSimulationData, nextStep, backStep } = useSimulation()

	const form = useForm<SimulationStep2Data>({
		resolver: zodResolver(simulationStep2Schema),
		defaultValues: {
			cnpj: simulationData.cnpj || "",
			legalName: simulationData.legalName || "",
			incorporationDate: simulationData.incorporationDate || "",
			annualRevenue: simulationData.annualRevenue || "",
			contactName: simulationData.contactName || "",
			contactPhone: simulationData.contactPhone || "",
			contactEmail: simulationData.contactEmail || ""
		}
	})

	const { control, setValue, setFocus, trigger, watch, resetField } = form
	const [isFetchingCnpj, setIsFetchingCnpj] = useState<boolean>(false)
	const cnpjValue = watch("cnpj")

	const clearCnpjRelatedFields = useCallback(() => {
		fieldsToClear.forEach((field) => resetField(field, { defaultValue: "" }))
		setSimulationData({
			cep: "",
			street: "",
			number: "",
			complement: "",
			neighborhood: "",
			city: "",
			state: ""
		})
	}, [resetField, setSimulationData])

	function handleClearCnpj() {
		setValue("cnpj", "")
		clearCnpjRelatedFields()
		setFocus("cnpj")
	}

	async function handleCnpjBlur(e: React.FocusEvent<HTMLInputElement>) {
		const cnpj = e.target.value.replace(/\D/g, "")
		if (cnpj.length !== 14) {
			if (cnpj.length === 0) clearCnpjRelatedFields()
			return
		}

		setIsFetchingCnpj(true)
		clearCnpjRelatedFields()

		try {
			const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
			if (!response.ok) {
				const errorData = await response.json().catch(() => null)
				const errorMessage = errorData?.message || "CNPJ não encontrado ou inválido."
				throw new Error(errorMessage)
			}
			const data = await response.json()

			const addressData = {
				cep: data.cep ? formatCep(data.cep.toString()) : "",
				street: data.logradouro || "",
				number: data.numero || "",
				complement: data.complemento || "",
				neighborhood: data.bairro || "",
				city: data.municipio || "",
				state: data.uf || ""
			}

			setValue("legalName", data.razao_social || "", { shouldValidate: true })
			setValue("incorporationDate", data.data_inicio_atividade ? maskDate(data.data_inicio_atividade.split("-").reverse().join("")) : "", {
				shouldValidate: true
			})
			setSimulationData(addressData) // Salva dados de endereço no contexto
			toast.success("Dados do CNPJ preenchidos.")
			trigger(["legalName", "incorporationDate"])
			setFocus("annualRevenue")
		} catch (error: any) {
			console.error("Falha ao buscar CNPJ:", error)
			toast.error("Erro ao buscar CNPJ", {
				description: error.message || "Não foi possível buscar os dados. Tente novamente."
			})
		} finally {
			setIsFetchingCnpj(false)
		}
	}

	function onSubmit(data: SimulationStep2Data) {
		setSimulationData(data)
		nextStep()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<h3 className="text-lg font-medium">Passo 2: Dados do Cliente</h3>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={control}
						name="cnpj"
						render={({ field }) => (
							<FormItem>
								<FormLabel>CNPJ *</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											placeholder="00.000.000/0000-00"
											{...field}
											onChange={(e) => {
												field.onChange(maskCnpj(e.target.value))
											}}
											onBlur={handleCnpjBlur}
											disabled={isFetchingCnpj}
										/>
										{isFetchingCnpj && <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin" />}
										{!isFetchingCnpj && cnpjValue && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-destructive"
												onClick={handleClearCnpj}
											>
												<X className="h-4 w-4" />
											</Button>
										)}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="legalName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Razão Social *</FormLabel>
								<FormControl>
									<Input placeholder="Preenchido automaticamente" {...field} disabled />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={control}
						name="incorporationDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Data de Fundação *</FormLabel>
								<FormControl>
									<Input placeholder="Preenchido automaticamente" {...field} disabled />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="annualRevenue"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Faturamento Anual *</FormLabel>
								<FormControl>
									<div className="relative">
										<span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">R$</span>
										<Input
											placeholder="1.000.000,00"
											className="pl-9"
											{...field}
											onChange={(e) => {
												field.onChange(maskNumber(e.target.value, 15))
											}}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<h3 className="border-t border-border pt-4 text-lg font-medium">Pessoa de Contato</h3>
				<FormField
					control={control}
					name="contactName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nome do Responsável *</FormLabel>
							<FormControl>
								<Input placeholder="João da Silva" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={control}
						name="contactPhone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Celular do Responsável *</FormLabel>
								<FormControl>
									<Input
										placeholder="(11) 99999-9999"
										{...field}
										onChange={(e) => {
											field.onChange(maskPhone(e.target.value))
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="contactEmail"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email do Responsável *</FormLabel>
								<FormControl>
									<Input placeholder="contato@empresa.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex justify-between pt-8">
					<Button type="button" variant="outline" onClick={backStep}>
						<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
					</Button>
					<Button type="submit">
						Próximo <ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</form>
		</Form>
	)
}

export { SimulationStep2 }
