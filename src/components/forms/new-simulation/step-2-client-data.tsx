"use client"

import { Loader2 } from "lucide-react"
import * as React from "react"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"

import { maskCnpj, maskDate, maskNumber, maskPhone } from "@/lib/masks"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function SimulationStep2() {
	const { control, setValue, setFocus } = useFormContext()
	const [isFetchingCnpj, setIsFetchingCnpj] = React.useState(false)

	async function handleCnpjBlur(e: React.FocusEvent<HTMLInputElement>) {
		const cnpj = e.target.value.replace(/\D/g, "")
		if (cnpj.length !== 14) return

		setIsFetchingCnpj(true)
		try {
			const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
			if (!response.ok) {
				throw new Error("CNPJ não encontrado ou inválido.")
			}
			const data = await response.json()

			// Preenche Step 2
			setValue("legalName", data.razao_social || "", { shouldValidate: true })
			if (data.data_inicio_atividade) {
				const [year, month, day] = data.data_inicio_atividade.split("-")
				setValue("incorporationDate", `${day}/${month}/${year}`, { shouldValidate: true })
			} else {
				setValue("incorporationDate", "", { shouldValidate: true })
			}

			// Preenche Step 3
			setValue("cep", (data.cep || "").replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2"), { shouldValidate: true })
			setValue("street", data.logradouro || "", { shouldValidate: true })
			setValue("number", data.numero || "", { shouldValidate: true })
			setValue("complement", data.complemento || "", { shouldValidate: true })
			setValue("neighborhood", data.bairro || "", { shouldValidate: true })
			setValue("city", data.municipio || "", { shouldValidate: true })
			setValue("state", data.uf || "", { shouldValidate: true })

			toast.success("Dados do CNPJ preenchidos.")
			setFocus("annualRevenue")
		} catch (error: any) {
			console.error("Falha ao buscar CNPJ:", error)
			toast.error("Erro ao buscar CNPJ", {
				description: error.message || "Não foi possível buscar os dados. Tente novamente."
			})
			// Limpa campos em caso de erro
			setValue("legalName", "", { shouldValidate: true })
			setValue("incorporationDate", "", { shouldValidate: true })
			setValue("cep", "", { shouldValidate: true })
			setValue("street", "", { shouldValidate: true })
			setValue("number", "", { shouldValidate: true })
			setValue("complement", "", { shouldValidate: true })
			setValue("neighborhood", "", { shouldValidate: true })
			setValue("city", "", { shouldValidate: true })
			setValue("state", "", { shouldValidate: true })
		} finally {
			setIsFetchingCnpj(false)
		}
	}

	return (
		<div className="space-y-6">
			<h3 className="text-lg font-medium">Passo 2: Dados do Cliente</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
										onChange={(e) => field.onChange(maskCnpj(e.target.value))}
										onBlur={handleCnpjBlur}
										disabled={isFetchingCnpj}
									/>
									{isFetchingCnpj && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
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
								<Input placeholder="Nome da Empresa" {...field} disabled={isFetchingCnpj} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<FormField
					control={control}
					name="incorporationDate"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Data de Fundação *</FormLabel>
							<FormControl>
								<Input placeholder="DD/MM/AAAA" {...field} onChange={(e) => field.onChange(maskDate(e.target.value))} disabled={isFetchingCnpj} />
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
							<FormLabel>Faturamento Anual</FormLabel>
							<FormControl>
								<div className="relative">
									<span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">R$</span>
									<Input placeholder="1.000.000,00" className="pl-9" {...field} onChange={(e) => field.onChange(maskNumber(e.target.value, 15))} />
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>

			<h3 className="text-lg font-medium pt-4 border-t border-border">Pessoa de Contato</h3>

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
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<FormField
					control={control}
					name="contactPhone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Celular do Responsável *</FormLabel>
							<FormControl>
								<Input placeholder="(11) 99999-9999" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
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
		</div>
	)
}
