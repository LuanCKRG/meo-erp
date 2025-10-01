/** biome-ignore-all lint/suspicious/noArrayIndexKey: <dont need this> */
"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, ArrowRight, DollarSign } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { getRate } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { maskNumber } from "@/lib/masks"
import { calculateInstallmentPayment } from "@/lib/utils"

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(value || 0)
}

const parseCurrency = (value: string | undefined): number => {
	if (!value) return 0
	return parseFloat(value.replace(/\D/g, "")) / 100 || 0
}

const installmentTerms = [12, 24, 36, 48, 60, 72]

// Tipagem melhorada para os props
type Step4PropsCreate = {
	onNext: () => void
	onBack: () => void
	isEditing?: false | null | undefined
	initialServiceFee?: never
	initialInterestRate?: never
}

type Step4PropsEdit = {
	onNext: () => void
	onBack: () => void
	isEditing: true
	initialServiceFee: number
	initialInterestRate: number
}

type Step4Props = Step4PropsCreate | Step4PropsEdit

const SimulationStep4 = ({ onNext, onBack, initialServiceFee, isEditing, initialInterestRate }: Step4Props) => {
	const form = useFormContext()

	const { data: rates, isLoading: isLoadingRates } = useQuery({
		queryKey: ["rates", "interest_rate", "service_fee"],
		queryFn: async () => {
			const [interest, service] = await Promise.all([getRate("interest_rate"), getRate("service_fee")])

			// Validação para garantir que os dados foram carregados corretamente
			if (!interest.success || !service.success) {
				throw new Error("Erro ao carregar taxas do banco de dados")
			}

			return {
				// Dividindo por 100 apenas uma vez aqui, já que vem como % do banco
				interest_rate: interest.data / 100,
				service_fee: service.data / 100
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		// Valores padrão em caso de erro
		retry: 3,
		retryDelay: 1000,
		// Não buscar rates se estiver no modo edição (já temos initialServiceFee)
		enabled: !isEditing
	})

	const watchedStringValues = form.watch(["equipmentValue", "laborValue", "otherCosts"])

	const [equipment, labor, others] = watchedStringValues.map(parseCurrency)
	const subtotal = (equipment || 0) + (labor || 0) + (others || 0)

	// Lógica para determinar qual serviceFee usar
	const serviceFee = isEditing ? initialServiceFee / 100 : (rates?.service_fee ?? 0.35) // 35% padrão se não estiver editando e não tiver carregado

	const interestRate = isEditing ? initialInterestRate / 100 : (rates?.interest_rate ?? 0.021) // 2.1% padrão

	const servicesValue = subtotal * serviceFee
	const formattedServicesValue = formatCurrency(servicesValue)

	const totalInvestment = subtotal + servicesValue
	const formattedTotalInvestment = formatCurrency(totalInvestment)

	return (
		<form className="space-y-6">
			<div className="grid grid-cols-1 @lg:grid-cols-2 gap-6">
				<div className="w-full space-y-6">
					<h3 className="text-lg font-medium">Passo 4: Valores</h3>
					<FormField
						control={form.control}
						name="equipmentValue"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Valor dos Equipamentos *</FormLabel>
								<FormControl>
									<div className="relative">
										<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
										<Input type="text" placeholder="0,00" className="pl-9" {...field} onChange={(e) => field.onChange(maskNumber(e.target.value, 14))} />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="laborValue"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Valor da Mão de Obra *</FormLabel>
								<FormControl>
									<div className="relative">
										<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
										<Input type="text" placeholder="0,00" className="pl-9" {...field} onChange={(e) => field.onChange(maskNumber(e.target.value, 14))} />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="otherCosts"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Outros Custos (Opcional)</FormLabel>
								<FormControl>
									<div className="relative">
										<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
										<Input type="text" placeholder="0,00" className="pl-9" {...field} onChange={(e) => field.onChange(maskNumber(e.target.value, 14))} />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormItem>
						<FormLabel>Serviços</FormLabel>
						<FormControl>
							<div className="relative">
								<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
								<Input type="text" className="pl-9" value={formattedServicesValue} disabled />
							</div>
						</FormControl>
					</FormItem>

					<FormField
						control={form.control}
						name="notes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Observações</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Adicione observações importantes sobre a simulação, como detalhes da instalação, condições especiais, etc."
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="w-full">
					<Card className="sticky top-20 shadow-md">
						<CardHeader>
							<CardTitle>Resumo do Investimento</CardTitle>
							<CardDescription>Cálculo em tempo real baseado nos valores fornecidos.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{!isEditing && isLoadingRates ? (
								<div className="space-y-4">
									<Skeleton className="h-16 w-full" />
									<Separator />
									<Skeleton className="h-5 w-24" />
									<div className="space-y-2">
										{[...Array(6)].map((_, i) => (
											<div key={i} className="flex justify-between">
												<Skeleton className="h-4 w-16" />
												<Skeleton className="h-4 w-24" />
											</div>
										))}
									</div>
								</div>
							) : (
								<>
									<div className="flex flex-col items-start rounded-lg border bg-muted p-4">
										<span className="text-sm text-muted-foreground">Total do Investimento</span>
										<span className="font-bold text-fluid-2xl">{formattedTotalInvestment}</span>
									</div>
									<Separator />
									<h4 className="font-medium">Parcelamento</h4>
									<div className="space-y-2">
										{installmentTerms.map((term, index) => {
											const installment = calculateInstallmentPayment({
												rate: interestRate,
												numberOfPeriods: term,
												presentValue: totalInvestment
											})
											return (
												<div key={`${term}-${index}`} className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">{term}x de</span>
													<span className="font-semibold">{formatCurrency(installment)}</span>
												</div>
											)
										})}
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="flex justify-between pt-8">
				<Button type="button" variant="outline" onClick={onBack}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
				</Button>
				<Button type="button" onClick={onNext} disabled={form.formState.isSubmitting}>
					Próximo <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</form>
	)
}

export { SimulationStep4 }
