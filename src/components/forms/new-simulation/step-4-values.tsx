// src/components/forms/new-simulation/step-4-values.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <dont need this> */
"use client"

import { ArrowLeft, DollarSign, Send, ArrowRight } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { maskNumber } from "@/lib/masks"
import { cn } from "@/lib/utils"

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
const interestRate = 0.021 // 2.1%

interface Step4Props {
	onNext: () => void
	onBack: () => void
}

const SimulationStep4 = ({ onNext, onBack }: Step4Props) => {
	const form = useFormContext()

	const watchedStringValues = form.watch(["equipmentValue", "laborValue", "otherCosts"])

	const [equipment, labor, others] = watchedStringValues.map(parseCurrency)
	const totalInvestment = (equipment || 0) + (labor || 0) + (others || 0)

	const calculateInstallment = (term: number) => {
		if (totalInvestment === 0) return 0
		const totalWithInterest = totalInvestment * (1 + interestRate)
		return totalWithInterest / term
	}

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
							<div className="flex flex-col items-start rounded-lg border bg-muted p-4">
								<span className="text-sm text-muted-foreground">Total do Investimento</span>
								<span className="font-bold text-fluid-2xl">{formattedTotalInvestment}</span>
							</div>
							<Separator />
							<h4 className="font-medium">Parcelamento</h4>
							<div className="space-y-2">
								{installmentTerms.map((term, index) => (
									<div key={`${term}-${index}`} className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">{term}x de</span>
										<span className="font-semibold">{formatCurrency(calculateInstallment(term))}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<div className="flex justify-between pt-8">
				<Button type="button" variant="outline" onClick={onBack}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
				</Button>
				<Button type="button" onClick={onNext} disabled={form.formState.isSubmitting}>
					Próximo <ArrowRight className="mr-2 h-4 w-4" />
				</Button>
			</div>
		</form>
	)
}

export { SimulationStep4 }
