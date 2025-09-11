"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"

import { getOrderById, updateOrder } from "@/actions/orders"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useSimulation } from "@/contexts/simulation-context"
import { maskCep, maskCnpj, maskDate, maskNumber, maskPhone } from "@/lib/masks"
import { cn } from "@/lib/utils"
import { SimulationStep1 } from "./new-simulation/step-1-project-data"
import { SimulationStep2 } from "./new-simulation/step-2-client-data"
import { SimulationStep3 } from "./new-simulation/step-3-installation"
import { SimulationStep4 } from "./new-simulation/step-4-values"
import { SimulationStep5 } from "./new-simulation/step-5-documents"
import {
	type EditSimulationData,
	editSimulationSchema,
	editSimulationStep5Schema,
	simulationStep1Schema,
	simulationStep2Schema,
	simulationStep3Schema,
	simulationStep4Schema
} from "./new-simulation/validation/new-simulation"

const STEPS_CONFIG = [
	{ id: 1, name: "Dados do Projeto", schema: simulationStep1Schema },
	{ id: 2, name: "Dados do Cliente", schema: simulationStep2Schema },
	{ id: 3, name: "Instalação", schema: simulationStep3Schema },
	{ id: 4, name: "Valores", schema: simulationStep4Schema },
	{ id: 5, name: "Documentos", schema: editSimulationStep5Schema }
]

type ExtendedOrderData = EditSimulationData & {
	kit_module_brand_id?: string | null
	kit_inverter_brand_id?: string | null
	kit_others_brand_id?: string | null
}

function OrderStepper({ currentStep }: { currentStep: number }) {
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

function EditOrderContent({
	orderId,
	customerId,
	onFinished,
	initialData
}: {
	orderId: string
	customerId: string
	onFinished: () => void
	initialData: ExtendedOrderData
}) {
	const [currentStep, setCurrentStep] = React.useState(1)
	const queryClient = useQueryClient()

	const form = useForm<ExtendedOrderData>({
		resolver: zodResolver(editSimulationSchema),
		defaultValues: initialData,
		mode: "onChange"
	})

	const validateCurrentStep = async (step: number): Promise<boolean> => {
		const stepSchema = STEPS_CONFIG[step - 1]?.schema
		if (!stepSchema) return true

		const currentData = form.getValues()
		const result = await stepSchema.safeParseAsync(currentData)

		if (!result.success) {
			const errors = result.error.issues
			errors.forEach((error) => {
				if (error.path.length > 0) {
					const fieldName = error.path[0] as keyof ExtendedOrderData
					form.setError(fieldName, {
						type: "manual",
						message: error.message
					})
				}
			})

			toast.error("Preencha todos os campos obrigatórios", {
				description: `Encontrados ${errors.length} erro${errors.length > 1 ? "s" : ""} no formulário`
			})

			return false
		}

		return true
	}

	const nextStep = async () => {
		const isValid = await validateCurrentStep(currentStep)
		if (isValid) {
			setCurrentStep((prev) => Math.min(prev + 1, STEPS_CONFIG.length))
		}
	}

	const backStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1))
	}

	const motionVariants = {
		initial: { opacity: 0, x: -20 },
		animate: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 20 }
	}

	const handleSubmitEntireForm = (data: EditSimulationData) => {
		const result = editSimulationSchema.safeParse(data)

		if (!result.success) {
			toast.error("Erro de validação final", {
				description: "Alguns dados parecem estar inconsistentes. Por favor, revise os passos."
			})
			console.error("Final Validation Error:", result.error.flatten().fieldErrors)
			return
		}

		toast.promise(updateOrder({ orderId, customerId, data: result.data }), {
			loading: "Atualizando pedido...",
			success: (res) => {
				if (res.success) {
					queryClient.invalidateQueries({ queryKey: ["orders"] })
					queryClient.invalidateQueries({ queryKey: ["order-details", orderId] })
					onFinished()
					return "Pedido atualizado com sucesso!"
				}
				throw new Error(res.message)
			},
			error: (err: Error) => {
				return err.message || "Ocorreu um erro inesperado."
			}
		})
	}

	return (
		<FormProvider {...form}>
			<Card className="w-full border-0 shadow-none">
				<CardHeader>
					<OrderStepper currentStep={currentStep} />
				</CardHeader>
				<CardContent>
					<AnimatePresence mode="wait">
						<motion.div
							key={currentStep}
							variants={motionVariants}
							initial="initial"
							animate="animate"
							exit="exit"
							transition={{ duration: 0.3 }}
							className="mt-8"
						>
							{currentStep === 1 && <SimulationStep1 onNext={nextStep} />}
							{currentStep === 2 && <SimulationStep2 onNext={nextStep} onBack={backStep} />}
							{currentStep === 3 && <SimulationStep3 onNext={nextStep} onBack={backStep} />}
							{currentStep === 4 && <SimulationStep4 onNext={nextStep} onBack={backStep} />}
							{currentStep === 5 && <SimulationStep5 onSubmit={form.handleSubmit(handleSubmitEntireForm)} onBack={backStep} />}
						</motion.div>
					</AnimatePresence>
				</CardContent>
			</Card>
		</FormProvider>
	)
}

export function EditOrderForm({ orderId, onFinished }: { orderId: string; onFinished: () => void }) {
	const { setIsCustomerDataLocked } = useSimulation()
	const {
		data: queryData,
		isLoading,
		error,
		isSuccess
	} = useQuery({
		queryKey: ["order-details", orderId],
		queryFn: () => getOrderById(orderId),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		enabled: !!orderId
	})

	React.useEffect(() => {
		if (isSuccess && queryData?.success) {
			setIsCustomerDataLocked(true)
		}
	}, [isSuccess, queryData, setIsCustomerDataLocked])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin" />
				<p className="ml-4">Carregando dados do pedido...</p>
			</div>
		)
	}

	if (error || !queryData?.success || !queryData.data) {
		return <p className="text-destructive text-center">Erro ao carregar os dados do pedido. Tente novamente.</p>
	}

	const { customer, ...order } = queryData.data

	const initialData: ExtendedOrderData = {
		systemPower: maskNumber(order.system_power?.toString() || "0", 9),
		currentConsumption: maskNumber(order.current_consumption?.toString() || "0", 9),
		energyProvider: order.energy_provider,
		structureType: order.structure_type,
		connectionVoltage: order.connection_voltage,
		notes: order.notes || "",
		kit_module: order.kit_module_id?.toString() || "",
		kit_inverter: order.kit_inverter_id?.toString() || "",
		kit_others: order.kit_others?.toString() || "",
		kit_module_brand_id: order.kit_module_brand_id,
		kit_inverter_brand_id: order.kit_inverter_brand_id,
		kit_others_brand_id: order.kit_others_brand_id,
		cnpj: maskCnpj(customer.cnpj),
		legalName: customer.company_name,
		incorporationDate: customer.incorporation_date ? customer.incorporation_date.split("-").reverse().join("/") : "",
		annualRevenue: maskNumber(customer.annual_revenue?.toString() || "0", 15),
		contactName: customer.contact_name,
		contactPhone: maskPhone(customer.contact_phone),
		contactEmail: customer.contact_email,
		cep: maskCep(customer.postal_code),
		street: customer.street,
		number: customer.number,
		complement: customer.complement || "",
		neighborhood: customer.neighborhood,
		city: customer.city,
		state: customer.state,
		equipmentValue: maskNumber(order.equipment_value?.toString() || "0", 14),
		laborValue: maskNumber(order.labor_value?.toString() || "0", 14),
		otherCosts: maskNumber(order.other_costs?.toString() || "0", 14),
		// Os campos de arquivo são iniciados como undefined para edição
		rgCnhSocios: undefined,
		balancoDRE2022: undefined,
		balancoDRE2023: undefined,
		balancoDRE2024: undefined,
		relacaoFaturamento: undefined,
		comprovanteEndereco: undefined,
		irpfSocios: undefined,
		fotosOperacao: undefined
	}

	return <EditOrderContent orderId={orderId} customerId={customer.id} onFinished={onFinished} initialData={initialData} />
}
