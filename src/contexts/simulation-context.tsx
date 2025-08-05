"use client"

import * as React from "react"

import type { SimulationData } from "@/components/forms/new-simulation/validation/new-simulation"

type SimulationContextType = {
	currentStep: number
	simulationData: Partial<SimulationData>
	setSimulationData: (data: Partial<SimulationData>) => void
	nextStep: () => void
	backStep: () => void
}

const SimulationContext = React.createContext<SimulationContextType | undefined>(undefined)

export function SimulationProvider({ children }: { children: React.ReactNode }) {
	const [currentStep, setCurrentStep] = React.useState(1)
	const [simulationData, setSimulationDataState] = React.useState<Partial<SimulationData>>({})

	const setSimulationData = React.useCallback((newData: Partial<SimulationData>) => {
		setSimulationDataState((prev) => ({ ...prev, ...newData }))
	}, [])

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
