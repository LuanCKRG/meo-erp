"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { brazilianStates, energyProviders } from "@/lib/constants"
import { maskPhone, maskCep, maskCnpj, maskDate } from "@/lib/masks"
import { cn } from "@/lib/utils"
import { type NewSimulationData, newSimulationSchema } from "@/lib/validations/simulation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
	style: "currency",
	currency: "BRL",
	minimumFractionDigits: 2
})

const numberFormatter = new Intl.NumberFormat("pt-BR", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
})

const formatAsCurrency = (value: string) => {
	const numberValue = parseFloat(value.replace(/\D/g, "")) / 100

	if (Number.isNaN(numberValue)) return ""

	return currencyFormatter.format(numberValue).replace("R$", "").trim()
}

const formatNumber = (value: string) => {
	const numberValue = parseFloat(value.replace(/\D/g, "")) / 100

	if (Number.isNaN(numberValue)) return ""

	return numberFormatter.format(numberValue)
}

const STEPS = [
	{ id: 1, name: "Dados do Projeto" },
	{ id: 2, name: "Dados do Cliente" },
	{ id: 3, name: "Instalação" },
	{ id: 4, name: "Valores" },
	{ id: 5, name: "Arquivos" }
]

export function NewSimulationForm({ className }: { className?: string }) {
	const [step, setStep] = React.useState(1)
	const [isFetchingCnpj, setIsFetchingCnpj] = React.useState(false)

	const form = useForm<NewSimulationData>({
		resolver: zodResolver(newSimulationSchema),
		defaultValues: {
			// Step 1
			systemPower: "",
			currentConsumption: "",
			energyProvider: "",
			// Step 2
			cnpj: "",
			legalName: "",
			incorporationDate: "",
			annualRevenue: "",
			contactName: "",
			contactPhone: "",
			contactEmail: "",
			// Step 3
			cep: "",
			street: "",
			number: "",
			complement: "",
			neighborhood: "",
			city: "",
			state: ""
		}
	})

	const { control, handleSubmit, setValue, setFocus, trigger, formState } = form

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
			setValue("cep", maskCep(data.cep || ""), { shouldValidate: true })
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

	async function onSubmit(data: NewSimulationData) {
		console.log(data)
		toast.success("Simulação enviada com sucesso!", {
			description: (
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(data, null, 2)}</code>
				</pre>
			)
		})
	}

	const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

	async function nextStep() {
		let fieldsToValidate: (keyof NewSimulationData)[] = []
		if (step === 1) {
			fieldsToValidate = ["systemPower", "currentConsumption", "energyProvider"]
		} else if (step === 2) {
			fieldsToValidate = ["cnpj", "legalName", "incorporationDate", "contactName", "contactPhone", "contactEmail"]
		} else if (step === 3) {
			fieldsToValidate = ["cep", "street", "number", "neighborhood", "city", "state"]
		}

		const output = await trigger(fieldsToValidate, { shouldFocus: true })
		if (output) {
			setStep((prev) => Math.min(prev + 1, STEPS.length))
		}
	}

	const motionVariants = {
		initial: { opacity: 0, x: -50 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 50 }
	}

	return (
		<Card className={cn("w-full border-0 shadow-none", className)}>
			<CardHeader>
				<div className="flex w-full items-start pt-6">
					{STEPS.map((s, index) => (
						<React.Fragment key={s.id}>
							<div className="flex flex-col items-center flex-1">
								<div
									className={cn(
										"w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-all",
										step >= s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
									)}
								>
									{s.id}
								</div>
								<p className={cn("mt-2 text-sm font-medium text-center", step >= s.id ? "text-primary" : "text-muted-foreground")}>{s.name}</p>
							</div>
							{index < STEPS.length - 1 && <div className={cn("flex-1 h-1 bg-border mt-4 transition-colors", step > s.id && "bg-primary")} />}
						</React.Fragment>
					))}
				</div>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
						<motion.div
							key={step}
							variants={motionVariants}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
						>
							{step === 1 && (
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
														<Input type="text" placeholder="9.999,99" {...field} onChange={(e) => field.onChange(formatNumber(e.target.value))} />
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
														<Input type="text" placeholder="9.999,99" {...field} onChange={(e) => field.onChange(formatNumber(e.target.value))} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
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
								</div>
							)}
							{step === 2 && (
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
															<Input
																placeholder="1.000.000,00"
																className="pl-9"
																{...field}
																onChange={(e) => field.onChange(formatAsCurrency(e.target.value))}
															/>
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
							)}
							{step === 3 && (
								<div className="space-y-6">
									<h3 className="text-lg font-medium">Passo 3: Local de Instalação</h3>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<FormField
											control={control}
											name="cep"
											render={({ field }) => (
												<FormItem className="md:col-span-1">
													<FormLabel>CEP *</FormLabel>
													<FormControl>
														<Input placeholder="00000-000" {...field} onChange={(e) => field.onChange(maskCep(e.target.value))} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="street"
											render={({ field }) => (
												<FormItem className="md:col-span-2">
													<FormLabel>Rua *</FormLabel>
													<FormControl>
														<Input placeholder="Avenida Paulista" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<FormField
											control={control}
											name="number"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Número *</FormLabel>
													<FormControl>
														<Input placeholder="123" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="complement"
											render={({ field }) => (
												<FormItem className="md:col-span-2">
													<FormLabel>Complemento (Opcional)</FormLabel>
													<FormControl>
														<Input placeholder="Apto 101, Bloco B" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<FormField
											control={control}
											name="neighborhood"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Bairro *</FormLabel>
													<FormControl>
														<Input placeholder="Bela Vista" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="city"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Cidade *</FormLabel>
													<FormControl>
														<Input placeholder="São Paulo" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="state"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Estado *</FormLabel>
													<Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Selecione o estado" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{brazilianStates.map((state) => (
																<SelectItem key={state.value} value={state.value}>
																	{state.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
							)}
							{step === 4 && (
								<div>
									<h3 className="text-lg font-medium">Passo 4: Valores</h3>
									<p className="text-muted-foreground mt-2">Campos para valores da simulação irão aqui.</p>
								</div>
							)}
							{step === 5 && (
								<div>
									<h3 className="text-lg font-medium">Passo 5: Arquivos</h3>
									<p className="text-muted-foreground mt-2">Campos para upload de arquivos irão aqui.</p>
								</div>
							)}
						</motion.div>

						<div className="flex justify-between pt-8">
							{step > 1 ? (
								<Button type="button" variant="outline" onClick={prevStep}>
									<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
								</Button>
							) : (
								<div />
							)}
							{step < STEPS.length ? (
								<Button type="button" onClick={nextStep}>
									Próximo <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							) : (
								<Button type="submit" disabled={formState.isSubmitting}>
									<Send className="mr-2 h-4 w-4" />
									Enviar Simulação
								</Button>
							)}
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
