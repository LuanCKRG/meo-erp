"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getCustomerById, updateCustomer } from "@/actions/customers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { brazilianStates } from "@/lib/constants"
import { maskCep, maskCnpj, maskDate, maskNumber, maskPhone } from "@/lib/masks"
import { cn } from "@/lib/utils"
import { type EditCustomerFormData, editCustomerFormSchema, editCustomerSchema } from "@/lib/validations/customer"

interface EditCustomerFormProps {
	customerId: string
	onFinished: () => void
}

function FormSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="space-y-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-10 w-full" />
			</div>
		</div>
	)
}

function EditCustomerFormContent({ customerId, onFinished, initialData }: EditCustomerFormProps & { initialData: EditCustomerFormData & { cnpj: string } }) {
	const [step, setStep] = useState(1)
	const [isFetchingCep, setIsFetchingCep] = useState(false)
	const queryClient = useQueryClient()

	const form = useForm<EditCustomerFormData>({
		resolver: zodResolver(editCustomerFormSchema), // Usamos o schema do formulário aqui
		defaultValues: initialData,
		mode: "onBlur"
	})

	const { control, handleSubmit, formState, setValue, setFocus, trigger, resetField } = form

	async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
		const cep = e.target.value.replace(/\D/g, "")
		if (cep.length !== 8) {
			return
		}
		setIsFetchingCep(true)
		try {
			const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
			const data = await response.json()
			if (data.erro) {
				toast.error("CEP não encontrado")
				resetField("street")
				resetField("neighborhood")
				resetField("city")
				resetField("state")
				return
			}
			setValue("street", data.logradouro, { shouldValidate: true })
			setValue("neighborhood", data.bairro, { shouldValidate: true })
			setValue("city", data.localidade, { shouldValidate: true })
			setValue("state", data.uf, { shouldValidate: true })
			setFocus("number")
		} catch (error) {
			console.error("Falha ao buscar CEP:", error)
			toast.error("Erro ao buscar CEP")
		} finally {
			setIsFetchingCep(false)
		}
	}

	const prevStep = () => setStep((prev) => prev - 1)

	async function nextStep() {
		let fieldsToValidate: (keyof EditCustomerFormData)[]
		if (step === 1) {
			fieldsToValidate = ["company_name", "incorporation_date", "annual_revenue"]
		} else {
			fieldsToValidate = ["contact_name", "contact_phone", "contact_email"]
		}

		const output = await trigger(fieldsToValidate, { shouldFocus: true })
		if (output) {
			setStep((prev) => prev + 1)
		}
	}

	async function onSubmit(formData: EditCustomerFormData) {
		// Transforma os dados para o formato do banco de dados ANTES de enviar para a action
		const parsedData = editCustomerSchema.parse(formData)

		const result = await updateCustomer(customerId, parsedData)

		if (result.success) {
			toast.success(result.message)
			queryClient.invalidateQueries({ queryKey: ["customers"] })
			onFinished()
		} else {
			toast.error("Erro na atualização", {
				description: result.message
			})
		}
	}

	const motionVariants = {
		initial: { opacity: 0, x: -50 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 50 }
	}

	return (
		<Card className="w-full border-0 shadow-none">
			<CardHeader>
				<div className="flex w-full items-start pt-6">
					<div className="flex flex-1 flex-col items-center">
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all",
								step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
							)}
						>
							1
						</div>
						<p className={cn("mt-2 text-sm font-medium", step >= 1 ? "text-primary" : "text-muted-foreground")}>Empresa</p>
					</div>
					<div className={cn("mt-4 h-1 flex-1 bg-border transition-colors", step > 1 && "bg-primary")} />
					<div className="flex flex-1 flex-col items-center">
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all",
								step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
							)}
						>
							2
						</div>
						<p className={cn("mt-2 text-sm font-medium", step >= 2 ? "text-primary" : "text-muted-foreground")}>Contato</p>
					</div>
					<div className={cn("mt-4 h-1 flex-1 bg-border transition-colors", step > 2 && "bg-primary")} />
					<div className="flex flex-1 flex-col items-center">
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all",
								step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
							)}
						>
							3
						</div>
						<p className={cn("mt-2 text-sm font-medium", step >= 3 ? "text-primary" : "text-muted-foreground")}>Endereço</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<FormItem>
											<FormLabel>CNPJ</FormLabel>
											<FormControl>
												<Input value={maskCnpj(initialData.cnpj)} disabled />
											</FormControl>
										</FormItem>
										<FormField
											control={control}
											name="company_name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Razão Social</FormLabel>
													<FormControl>
														<Input placeholder="Nome da Empresa LTDA" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<FormField
											control={control}
											name="incorporation_date"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Data de Fundação</FormLabel>
													<FormControl>
														<Input placeholder="DD/MM/AAAA" {...field} onChange={(e) => field.onChange(maskDate(e.target.value))} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="annual_revenue"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Faturamento Anual (Opcional)</FormLabel>
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
								</div>
							)}
							{step === 2 && (
								<div className="space-y-6">
									<FormField
										control={control}
										name="contact_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nome do Responsável</FormLabel>
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
											name="contact_phone"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Celular do Responsável</FormLabel>
													<FormControl>
														<Input placeholder="(11) 99999-9999" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="contact_email"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email do Responsável</FormLabel>
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
									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<FormField
											control={control}
											name="postal_code"
											render={({ field }) => (
												<FormItem className="md:col-span-1">
													<FormLabel>CEP</FormLabel>
													<FormControl>
														<div className="relative">
															<Input placeholder="00000-000" {...field} onChange={(e) => field.onChange(maskCep(e.target.value))} onBlur={handleCepBlur} />
															{isFetchingCep && <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin" />}
														</div>
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
													<FormLabel>Rua</FormLabel>
													<FormControl>
														<Input placeholder="Avenida Paulista" {...field} disabled={isFetchingCep} />
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
													<FormLabel>Número</FormLabel>
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
													<FormLabel>Bairro</FormLabel>
													<FormControl>
														<Input placeholder="Bela Vista" {...field} disabled={isFetchingCep} />
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
													<FormLabel>Cidade</FormLabel>
													<FormControl>
														<Input placeholder="São Paulo" {...field} disabled={isFetchingCep} />
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
													<FormLabel>Estado</FormLabel>
													<Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isFetchingCep}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Selecione o estado">{field.value}</SelectValue>
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
						</motion.div>
						<div className="flex justify-between pt-4">
							{step > 1 ? (
								<Button type="button" variant="outline" onClick={prevStep}>
									<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
								</Button>
							) : (
								<div />
							)}
							{step < 3 && (
								<Button type="button" onClick={nextStep}>
									Próximo <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							)}
							{step === 3 && (
								<Button type="submit" disabled={formState.isSubmitting}>
									{formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
									Salvar Alterações
								</Button>
							)}
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}

export function EditCustomerForm({ customerId, onFinished }: EditCustomerFormProps) {
	const {
		data: queryData,
		isLoading,
		error
	} = useQuery({
		queryKey: ["customer-details", customerId],
		queryFn: () => getCustomerById(customerId),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		enabled: !!customerId
	})

	if (isLoading) {
		return <FormSkeleton />
	}

	if (error || !queryData?.success || !queryData.data) {
		return <p className="text-center text-destructive">Erro ao carregar os dados do cliente. Tente novamente.</p>
	}

	const customer = queryData.data

	// Transforma os dados do banco para o formato esperado pelo formulário
	const initialData = {
		company_name: customer.company_name,
		incorporation_date: customer.incorporation_date ? maskDate(customer.incorporation_date.split("-").reverse().join("")) : "",
		annual_revenue: customer.annual_revenue === null ? undefined : maskNumber(customer.annual_revenue.toString(), 15),
		contact_name: customer.contact_name,
		contact_phone: maskPhone(customer.contact_phone),
		contact_email: customer.contact_email,
		postal_code: maskCep(customer.postal_code),
		street: customer.street,
		number: customer.number,
		complement: customer.complement || "",
		neighborhood: customer.neighborhood,
		city: customer.city,
		state: customer.state,
		// O CNPJ não é editável, mas é necessário para exibição
		cnpj: customer.cnpj
	}

	return <EditCustomerFormContent customerId={customerId} onFinished={onFinished} initialData={initialData} />
}
