// step-2-client-data.tsx
"use client"

import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { formatCep } from "@/lib/formatters"
import { maskCnpj, maskDate, maskNumber, maskPhone } from "@/lib/masks"

interface Step2Props {
	onNext: () => void
	onBack: () => void
}

const SimulationStep2 = ({ onNext, onBack }: Step2Props) => {
	const form = useFormContext()
	const { setValue, setFocus, trigger, watch, resetField } = form
	const [isFetchingCnpj, setIsFetchingCnpj] = useState<boolean>(false)
	const cnpjValue = watch("cnpj")

	const fieldsToClear = ["legalName", "incorporationDate"] as const

	const clearCnpjRelatedFields = () => {
		fieldsToClear.forEach((field) => resetField(field, { defaultValue: "" }))
		// Clear address fields
		setValue("cep", "")
		setValue("street", "")
		setValue("number", "")
		setValue("complement", "")
		setValue("neighborhood", "")
		setValue("city", "")
		setValue("state", "")
	}

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

			setValue("legalName", data.razao_social || "", { shouldValidate: true })
			setValue("incorporationDate", data.data_inicio_atividade ? maskDate(data.data_inicio_atividade.split("-").reverse().join("")) : "", {
				shouldValidate: true
			})

			// Set address data
			setValue("cep", data.cep ? formatCep(data.cep.toString()) : "")
			setValue("street", data.logradouro || "")
			setValue("number", data.numero || "")
			setValue("complement", data.complemento || "")
			setValue("neighborhood", data.bairro || "")
			setValue("city", data.municipio || "")
			setValue("state", data.uf || "")

			toast.success("Dados do CNPJ preenchidos.")
			trigger(["legalName", "incorporationDate"])
			setFocus("annualRevenue")
		} catch (error) {
			console.error("Falha ao buscar CNPJ:", error)
			const errorMessage = error instanceof Error ? error.message : "Não foi possível buscar os dados. Tente novamente."
			toast.error("Erro ao buscar CNPJ", {
				description: errorMessage
			})
		} finally {
			setIsFetchingCnpj(false)
		}
	}

	return (
		<form className="space-y-6">
			<h3 className="text-lg font-medium">Passo 2: Dados do Cliente</h3>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<FormField
					control={form.control}
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
					control={form.control}
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
					control={form.control}
					name="incorporationDate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Data de Fundação *</FormLabel>
							<FormControl>
								<Input
									placeholder="DD/MM/AAAA"
									{...field}
									onChange={(e) => {
										field.onChange(maskDate(e.target.value))
									}}
									disabled
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="annualRevenue"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Faturamento Anual</FormLabel>
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
				control={form.control}
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
					control={form.control}
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
					control={form.control}
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
				<Button type="button" variant="outline" onClick={onBack}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
				</Button>
				<Button type="button" onClick={onNext}>
					Próximo <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</form>
	)
}

export { SimulationStep2 }
