"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

import { getCurrentUser } from "@/actions/auth"
import { getCurrentPartnerDetails } from "@/actions/partners"
import { NewSimulationForm } from "@/components/forms/new-simulation/new-simulation-form"
import { SimulationSelector } from "@/components/forms/new-simulation/simulation-selector"
import { SimulationProvider, useSimulation } from "@/contexts/simulation-context"

function SimulationPageContent() {
	const {
		data: user,
		isLoading: isLoadingUser,
		error: userError
	} = useQuery({
		queryKey: ["currentUser"],
		queryFn: getCurrentUser,
		staleTime: Infinity,
		refetchOnWindowFocus: false
	})

	const isPartner = user?.role === "partner"

	const {
		data: partnerDetails,
		isLoading: isLoadingPartner,
		error: partnerError
	} = useQuery({
		queryKey: ["currentPartnerDetails"],
		queryFn: getCurrentPartnerDetails,
		enabled: isPartner // Apenas busca se o usuário for um parceiro
	})

	const { setPartnerId, setSellerId, partnerId, partnerName, sellerName, setPartnerName, setSellerName } = useSimulation()

	// Preenche o contexto automaticamente APENAS se o usuário for um parceiro
	useEffect(() => {
		if (isPartner && user?.id && partnerDetails?.sellerId && user.name) {
			setPartnerId(user.id)
			setSellerId(partnerDetails.sellerId)
			setPartnerName(user.name) // Parceiro logado é o parceiro da simulação
			// O nome do seller associado precisaria de outra busca, mas o ID é o suficiente para a action.
			// Podemos adicionar a busca do nome do seller se for necessário exibir.
		}
	}, [isPartner, user, partnerDetails, setPartnerId, setSellerId, setPartnerName])

	const isLoading = isLoadingUser || (isPartner && isLoadingPartner)
	const error = userError || (isPartner && partnerError)

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-16">
				<Loader2 className="h-8 w-8 animate-spin" />
				<p>Carregando dados do usuário...</p>
			</div>
		)
	}

	if (error || !user?.role) {
		return <p className="text-destructive text-center">Não foi possível carregar os dados do usuário. Tente recarregar a página.</p>
	}

	const showSelector = user.role === "admin" || user.role === "seller"
	const isFormDisabled = showSelector && !partnerId

	const getContextText = () => {
		if (!showSelector || !partnerId) return null
		if (user.role === "admin" && sellerName && partnerName) {
			return `para ${sellerName} / ${partnerName}`
		}
		if (user.role === "seller" && partnerName) {
			return `para ${partnerName}`
		}
		return null
	}

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Nova Simulação</h1>
					<p className="text-muted-foreground">Preencha os dados abaixo para criar uma nova simulação.</p>
				</div>
				{getContextText() && <p className="font-medium text-muted-foreground text-sm text-right">Criando simulação {getContextText()}</p>}
			</div>
			{showSelector && <SimulationSelector role={user.role} />}
			<NewSimulationForm isDisabled={isFormDisabled} />
		</div>
	)
}

const AddSimulationPage = () => {
	// O Provedor de Contexto agora envolve todo o conteúdo da página.
	return (
		<SimulationProvider>
			<SimulationPageContent />
		</SimulationProvider>
	)
}

export default AddSimulationPage
