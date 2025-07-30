"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { DollarSign } from "lucide-react"

import { maskNumber } from "@/lib/masks"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(value || 0)
}

const parseCurrency = (value: string | undefined): number => {
	if (!value) return 0
	return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0
}

const installmentTerms = [12, 24, 36, 48, 60, 72]
const interestRate = 0.021 // 2.1%

export function SimulationStep4() {
	const { control, watch } = useFormContext()

	// Observa os valores do formulário como strings.
	const watchedStringValues = watch(["equipmentValue", "laborValue", "otherCosts"])

	const [totalInvestment, setTotalInvestment] = React.useState(0)

	// Recalcula o total sempre que os valores em string mudam
	React.useEffect(() => {
		const [equipment, labor, others] = watchedStringValues.map(parseCurrency)
		const total = equipment + labor + others
		setTotalInvestment(isNaN(total) ? 0 : total)
	}, [watchedStringValues])

	const calculateInstallment = (term: number) => {
		if (totalInvestment === 0) return 0
		const totalWithInterest = totalInvestment * (1 + interestRate)
		return totalWithInterest / term
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-6 md:flex-row">
				{/* Coluna de Inputs */}
				<div className="w-full space-y-6 md:w-1/2">
					<h3 className="text-lg font-medium">Passo 4: Valores</h3>
					<FormField
						control={control}
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
						control={control}
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
						control={control}
						name="otherCosts"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Outros Custos *</FormLabel>
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
				</div>

				{/* Coluna de Resultados */}
				<div className="w-full md:w-1/2">
					<Card className="sticky top-20 shadow-md">
						<CardHeader>
							<CardTitle>Resumo do Investimento</CardTitle>
							<CardDescription>Cálculo em tempo real baseado nos valores fornecidos.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between rounded-lg border bg-muted p-4">
								<span className="text-muted-foreground">Total do Investimento</span>
								<span className="text-2xl font-bold">{formatCurrency(totalInvestment)}</span>
							</div>
							<Separator />
							<h4 className="font-medium">Parcelamento (Taxa de {interestRate * 100}%)</h4>
							<div className="space-y-2">
								{installmentTerms.map((term) => (
									<div key={term} className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">{term}x de</span>
										<span className="font-semibold">{formatCurrency(calculateInstallment(term))}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
