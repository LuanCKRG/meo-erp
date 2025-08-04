"use client"

import * as React from "react"
import type { NewSimulationData } from "@/lib/validations/simulation"

type SimulationState = Partial<NewSimulationData>

type SimulationContextType = {
	currentStep: number
	simulationData: SimulationState
	setSimulationData: (data: SimulationState) => void
	nextStep: () => void
	backStep: () => void
}

const SimulationContext = React.createContext<SimulationContextType | undefined>(undefined)

export function SimulationProvider({ children }: { children: React.ReactNode }) {
	const [currentStep, setCurrentStep] = React.useState(1)
	const [simulationData, setSimulationDataState] = React.useState<SimulationState>({})

	const setSimulationData = (newData: Partial<NewSimulationData>) => {
		setSimulationDataState((prev) => ({ ...prev, ...newData }))
	}

	const nextStep = () => {
		setCurrentStep((prev) => Math.min(prev + 1, 4))
	}

	const backStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1))
	}

	const value = {
		currentStep,
		simulationData,
		setSimulationData,
		nextStep,
		backStep
	}

	return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export function useSimulation() {
	const context = React.useContext(SimulationContext)
	if (context === undefined) {
		throw new Error("useSimulation must be used within a SimulationProvider")
	}
	return context
}
