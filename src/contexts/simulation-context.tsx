"use client"

import * as React from "react"

import type { SimulationData } from "@/components/forms/new-simulation/validation/new-simulation"

type FullSimulationData = Partial<SimulationData> & {
	kit_module_brand_id?: string | null
	kit_inverter_brand_id?: string | null
	kit_others_brand_id?: string | null
}

type SimulationContextType = {
	currentStep: number
	simulationData: FullSimulationData
	setSimulationData: (data: FullSimulationData) => void
	nextStep: () => void
	backStep: () => void
}

const SimulationContext = React.createContext<SimulationContextType | undefined>(undefined)

export function SimulationProvider({ children, initialData }: { children: React.ReactNode; initialData?: FullSimulationData }) {
	const [currentStep, setCurrentStep] = React.useState(1)
	const [simulationData, setSimulationDataState] = React.useState<FullSimulationData>(initialData || {})

	const setSimulationData = React.useCallback((newData: FullSimulationData) => {
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
