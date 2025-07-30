"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react"
import * as React from "react"
import { FormProvider, useForm, type FieldErrors } from "react-hook-form"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"

import { getEquipmentTypes } from "@/actions/equipments"
import { cn } from "@/lib/utils"
import {
	newSimulationSchema,
	type NewSimulationData,
	simulationStep1Schema,
	simulationStep2Schema,
	simulationStep3Schema,
	simulationStep4Schema
} from "./validation/new-simulation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { SimulationStep1 } from "./step-1-project-data"
import { SimulationStep2 } from "./step-2-client-data"
import { SimulationStep3 } from "./step-3-installation"
import { SimulationStep4 } from "./step-4-values"
import { Skeleton } from "@/components/ui/skeleton"

const STEPS = [
	{ id: 1, name: "Dados do Projeto", schema: simulationStep1Schema },
	{ id: 2, name: "Dados do Cliente", schema: simulationStep2Schema },
	{ id: 3, name: "Instalação", schema: simulationStep3Schema },
	{ id: 4, name: "Valores", schema: simulationStep4Schema },
	{ id: 5, name: "Arquivos" }
]

const parseCurrency = (value: string | undefined): number => {
	if (!value) return 0
	return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0
}

export function NewSimulationForm({ className }: { className?: string }) {
	const [step, setStep] = React.useState(1)

	const { data: equipmentTypes = [], isLoading: isLoadingTypes } = useQuery({
		queryKey: ["equipmentTypes"],
		queryFn: getEquipmentTypes
	})

	const form = useForm<NewSimulationData>({
		resolver: zodResolver(newSimulationSchema),
		mode: "onSubmit",
		defaultValues: {
			systemPower: "",
			currentConsumption: "",
			energyProvider: undefined,
			structureType: "",
			connectionVoltage: undefined,
			kit_module: "",
			kit_inverter: "",
			kit_others: "",
			cnpj: "",
			legalName: "",
			incorporationDate: "",
			annualRevenue: "",
			contactName: "",
			contactPhone: "",
			contactEmail: "",
			cep: "",
			street: "",
			number: "",
			complement: "",
			neighborhood: "",
			city: "",
			state: undefined,
			equipmentValue: "",
			laborValue: "",
			otherCosts: ""
		}
	})

	const { handleSubmit, trigger, formState } = form

	// function onValidationError(errors: FieldErrors<NewSimulationData>) {
	// 	console.error("Erros de validação do Zod:", errors)

	// 	const errorKeys = Object.keys(errors) as (keyof NewSimulationData)[]

	// 	const firstErrorStep = STEPS.find(
	// 		(s) => s.schema && Object.keys((s.schema as any).shape).some((field) => errorKeys.includes(field as keyof NewSimulationData))
	// 	)
	// 	const firstErrorKey = errorKeys[0]

	// 	if (firstErrorStep && firstErrorStep.id !== step) {
	// 		setStep(firstErrorStep.id)
	// 		setTimeout(() => {
	// 			toast.error("Existem erros no Passo " + firstErrorStep.id, {
	// 				description: `Por favor, verifique os campos antes de continuar.`
	// 			})
	// 		}, 100)
	// 	} else {
	// 		const firstErrorMessage = errors[firstErrorKey]?.message
	// 		toast.error("Erro de validação", {
	// 			description: `Por favor, verifique o campo. Erro: ${firstErrorMessage}`
	// 		})
	// 	}
	// }

	async function onSubmit(data: NewSimulationData) {
		// Converte os campos de string para número antes de submeter
		const processedData = {
			...data,
			systemPower: parseCurrency(data.systemPower),
			currentConsumption: parseCurrency(data.currentConsumption),
			annualRevenue: parseCurrency(data.annualRevenue),
			equipmentValue: parseCurrency(data.equipmentValue),
			laborValue: parseCurrency(data.laborValue),
			otherCosts: parseCurrency(data.otherCosts)
		}

		console.log("Dados do formulário válidos e processados:", processedData)
		toast.success("Simulação enviada com sucesso!", {
			description: (
				<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
					<code className="text-white">{JSON.stringify(processedData, null, 2)}</code>
				</pre>
			)
		})
	}

	const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

	async function nextStep() {
		const currentStepInfo = STEPS.find((s) => s.id === step)

		if (!currentStepInfo?.schema) {
			setStep((prev) => Math.min(prev + 1, STEPS.length))
			return
		}

		const schemaForStep = currentStepInfo.schema as any
		const fieldsToValidate = Object.keys(schemaForStep.shape) as (keyof NewSimulationData)[]
		const output = await trigger(fieldsToValidate, { shouldFocus: true })

		if (output) {
			setStep((prev) => Math.min(prev + 1, STEPS.length))
		} else {
			// onValidationError will handle the error toast
		}
	}

	const motionVariants = {
		initial: { opacity: 0, x: -20 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 20 }
	}

	if (isLoadingTypes) {
		return (
			<Card className={cn("w-full border-0 shadow-none", className)}>
				<CardHeader>
					<div className="flex w-full items-start pt-6">
						{[...Array(5)].map((key, index) => (
							<React.Fragment key={key}>
								<div className="flex flex-col items-center flex-1">
									<Skeleton className="h-8 w-8 rounded-full" />
									<Skeleton className="h-4 w-20 mt-2 rounded-md" />
								</div>
								{index < 4 && <Skeleton className="flex-1 h-1 mt-4" />}
							</React.Fragment>
						))}
					</div>
				</CardHeader>
				<CardContent className="mt-8">
					<div className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-10 w-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-1/3" />
								<Skeleton className="h-10 w-full" />
							</div>
						</div>
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</CardContent>
			</Card>
		)
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
				<FormProvider {...form}>
					<Form {...form}>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
							{/* <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-6 mt-8"> */}
							<AnimatePresence mode="wait">
								<motion.div key={step} variants={motionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
									{step === 1 && <SimulationStep1 />}
									{step === 2 && <SimulationStep2 />}
									{step === 3 && <SimulationStep3 />}
									{step === 4 && <SimulationStep4 />}
									{step === 5 && (
										<div>
											<h3 className="text-lg font-medium">Passo 5: Arquivos</h3>
											<p className="text-muted-foreground mt-2">Campos para upload de arquivos irão aqui.</p>
										</div>
									)}
								</motion.div>
							</AnimatePresence>

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
										{formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
										Enviar Simulação
									</Button>
								)}
							</div>
						</form>
					</Form>
				</FormProvider>
			</CardContent>
		</Card>
	)
}
