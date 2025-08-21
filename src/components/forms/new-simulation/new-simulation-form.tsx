"use client"

import { AnimatePresence, motion } from "framer-motion"
import * as React from "react"
import { toast } from "sonner"

import { createSimulation } from "@/actions/simulations"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SimulationProvider, useSimulation } from "@/contexts/simulation-context"
import { cn } from "@/lib/utils"
import { SimulationStep1 } from "./step-1-project-data"
import { SimulationStep2 } from "./step-2-client-data"
import { SimulationStep3 } from "./step-3-installation"
import { SimulationStep4 } from "./step-4-values"
import { newSimulationSchema } from "./validation/new-simulation"

const STEPS_CONFIG = [
	{ id: 1, name: "Dados do Projeto" },
	{ id: 2, name: "Dados do Cliente" },
	{ id: 3, name: "Instalação" },
	{ id: 4, name: "Valores" }
]

function SimulationStepper() {
	const { currentStep } = useSimulation()

	return (
		<div className="flex w-full items-start pt-6">
			{STEPS_CONFIG.map((stepConfig, index) => (
				<React.Fragment key={stepConfig.id}>
					<div className="flex flex-1 flex-col items-center">
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all",
								currentStep >= stepConfig.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
							)}
						>
							{stepConfig.id}
						</div>
						<p
							className={cn(
								"mt-2 text-center text-sm font-medium",
								currentStep >= stepConfig.id ? "text-primary" : "text-muted-foreground",
								currentStep !== stepConfig.id && "hidden md:block"
							)}
						>
							{stepConfig.name}
						</p>
					</div>
					{index < STEPS_CONFIG.length - 1 && (
						<div className={cn("mt-4 h-1 flex-1 bg-border transition-colors", currentStep > stepConfig.id && "bg-primary")} />
					)}
				</React.Fragment>
			))}
		</div>
	)
}

function SimulationContent() {
	const { currentStep, simulationData } = useSimulation()

	const motionVariants = {
		initial: { opacity: 0, x: -20 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 20 }
	}

	const handleSubmitEntireForm = () => {
		const result = newSimulationSchema.safeParse(simulationData)

		if (!result.success) {
			toast.error("Erro de validação final", {
				description: "Alguns dados parecem estar inconsistentes. Por favor, revise os passos."
			})
			console.error("Final Validation Error:", result.error.flatten())
			return
		}

		toast.promise(createSimulation(result.data), {
			loading: "Salvando simulação...",
			success: (res) => {
				if (res.success) {
					// Aqui você pode resetar o formulário ou redirecionar o usuário
					return `Simulação #${res.data.kdi} salva com sucesso!`
				}
				// Se success for false, o toast.promise trata como erro
				throw new Error(res.message)
			},
			error: (err: Error) => {
				return err.message || "Ocorreu um erro inesperado."
			}
		})
	}

	return (
		<AnimatePresence mode="wait">
			<motion.div key={currentStep} variants={motionVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="mt-8">
				{currentStep === 1 && <SimulationStep1 />}
				{currentStep === 2 && <SimulationStep2 />}
				{currentStep === 3 && <SimulationStep3 />}
				{currentStep === 4 && <SimulationStep4 onSubmitFinal={handleSubmitEntireForm} />}
			</motion.div>
		</AnimatePresence>
	)
}

export function NewSimulationForm({ className }: { className?: string }) {
	return (
		<SimulationProvider>
			<Card className={cn("w-full border-0 shadow-none", className)}>
				<CardHeader>
					<SimulationStepper />
				</CardHeader>
				<CardContent>
					<SimulationContent />
				</CardContent>
			</Card>
		</SimulationProvider>
	)
}
