"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, DollarSign, Send } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useSimulation } from "@/contexts/simulation-context"
import { maskNumber } from "@/lib/masks"
import { cn } from "@/lib/utils"
import { type SimulationStep4Data, simulationStep4Schema } from "./validation/new-simulation"

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

interface StepProps {
	onSubmitFinal: () => void
}

// Função para determinar a classe de tamanho da fonte com base no comprimento do valor
const getFontSizeForValue = (value: string): string => {
	const length = value.length
	if (length <= 12) {
		// ex: R$ 99.999,99
		return "text-2xl"
	}

	if (length <= 16) {
		// ex: R$ 9.999.999,99
		return "text-xl"
	}

	if (length <= 19) {
		// ex: R$ 9.999.999,99
		return "text-lg"
	}

	if (length <= 22) {
		// ex: R$ 9.999.999,99
		return "text-sm"
	}

	// ex: R$ 99.999.999,99
	return "text-xs"
}

const SimulationStep4 = ({ onSubmitFinal }: StepProps) => {
	const { simulationData, setSimulationData, backStep } = useSimulation()
	const { state } = useSidebar()

	const form = useForm<SimulationStep4Data>({
		resolver: zodResolver(simulationStep4Schema),
		defaultValues: {
			equipmentValue: simulationData.equipmentValue || "",
			laborValue: simulationData.laborValue || "",
			otherCosts: simulationData.otherCosts || ""
		}
	})

	const watchedStringValues = form.watch(["equipmentValue", "laborValue", "otherCosts"])
	const [totalInvestment, setTotalInvestment] = useState(0)

	useEffect(() => {
		const [equipment, labor, others] = watchedStringValues.map(parseCurrency)
		const total = equipment + labor + others
		setTotalInvestment(Number.isNaN(total) ? 0 : total)
	}, [watchedStringValues])

	const calculateInstallment = (term: number) => {
		if (totalInvestment === 0) return 0
		const totalWithInterest = totalInvestment * (1 + interestRate)
		return totalWithInterest / term
	}

	function onSubmit(data: SimulationStep4Data) {
		setSimulationData(data)
		onSubmitFinal() // Chama a função final de submissão do contexto
	}

	const formattedTotalInvestment = formatCurrency(totalInvestment)

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="flex flex-col gap-6 md:flex-row">
					<div className="w-full space-y-6 md:w-1/2">
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
					</div>
					<div className="w-full md:w-1/2">
						<Card className="sticky top-20 shadow-md">
							<CardHeader>
								<CardTitle>Resumo do Investimento</CardTitle>
								<CardDescription>Cálculo em tempo real baseado nos valores fornecidos.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex flex-col items-start rounded-lg border bg-muted p-4">
									<span className="text-sm text-muted-foreground">Total do Investimento</span>
									<span
										className={cn(
											"hidden sm:flex font-bold",
											state === "expanded" ? `${getFontSizeForValue(formattedTotalInvestment)} lg:text-xl xl:text-2xl` : "md:text-xl lg:text-2xl"
										)}
									>
										{formattedTotalInvestment}
									</span>
									<span className={cn("font-bold md:hidden", getFontSizeForValue(formattedTotalInvestment))}>{formattedTotalInvestment}</span>
								</div>
								<Separator />
								<h4 className="font-medium">Parcelamento</h4>
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

				<div className="flex justify-between pt-8">
					<Button type="button" variant="outline" onClick={backStep}>
						<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
					</Button>
					<Button type="submit" disabled={form.formState.isSubmitting}>
						<Send className="mr-2 h-4 w-4" />
						Enviar Simulação
					</Button>
				</div>
			</form>
		</Form>
	)
}

export { SimulationStep4 }
