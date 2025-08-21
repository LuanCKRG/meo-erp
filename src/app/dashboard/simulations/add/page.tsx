import Link from "next/link"
import { List } from "lucide-react"

import { hasPermission } from "@/actions/auth"
import { NewSimulationForm } from "@/components/forms/new-simulation/new-simulation-form"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

const AddSimulationPage = async () => {
	const canCreateSimulation = await hasPermission("simulations:create")

	if (!canCreateSimulation) {
		redirect("/dashboard/home")
	}

	const canViewSimulation = await hasPermission("simulations:view")

	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Nova Simulação</h1>
					<p className="text-muted-foreground">Preencha os dados abaixo para criar uma nova simulação.</p>
				</div>
				{canViewSimulation && (
					<Button variant="outline" asChild>
						<Link href="/dashboard/simulations">
							<List />
							Ver Simulações
						</Link>
					</Button>
				)}
			</div>
			<NewSimulationForm />
		</div>
	)
}

export default AddSimulationPage
