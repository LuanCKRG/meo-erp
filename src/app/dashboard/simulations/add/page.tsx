import { AlertTriangle, List } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { hasPermission } from "@/actions/auth"
import { getCurrentPartnerDetails } from "@/actions/partners"
import { NewSimulationForm } from "@/components/forms/new-simulation/new-simulation-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

const AddSimulationPage = async () => {
	const canCreateSimulation = await hasPermission("simulations:create")
	if (!canCreateSimulation) {
		redirect("/dashboard/home")
	}

	const supabase = await createClient()
	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) {
		redirect("/")
	}

	const { data: userRoleData } = await supabase.from("users").select("role").eq("id", user.id).single()
	const isPartnerRole = userRoleData?.role === "partner"

	const partnerDetails = await getCurrentPartnerDetails()
	const canViewSimulations = await hasPermission("simulations:view")

	// Lógica positiva e explícita: O usuário pode simular SE E SOMENTE SE
	// ele for um parceiro E estiver aprovado E ativo E tiver um gestor.
	const isUserAllowedToSimulate = isPartnerRole && partnerDetails?.status === "approved" && partnerDetails?.isActive && !!partnerDetails.sellerId

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Nova Simulação</h1>
					<p className="text-muted-foreground">Preencha os dados abaixo para criar uma nova simulação.</p>
				</div>
				{canViewSimulations && (
					<Button variant="outline" asChild>
						<Link href="/dashboard/simulations">
							<List />
							Ver Simulações
						</Link>
					</Button>
				)}
			</div>

			{isUserAllowedToSimulate ? (
				<NewSimulationForm />
			) : (
				<Alert variant="destructive" className="max-w-lg mx-auto">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Acesso Restrito</AlertTitle>
					<AlertDescription>
						Mesmo tendo permissão para acessar a página, apenas Parceiros aprovados, ativos e com um gestor associado conseguem adicionar uma nova simulação.
					</AlertDescription>
				</Alert>
			)}
		</div>
	)
}

export default AddSimulationPage
