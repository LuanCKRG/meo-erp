import { InterestRateForm } from "@/components/forms/interest-rate-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const AdminSettingsPage = () => {
	return (
		<div className="flex flex-col gap-8">
			<div className="space-y-1.5">
				<h1 className="text-3xl font-bold tracking-tight">Configurações Gerais</h1>
				<p className="text-muted-foreground">Ajuste os parâmetros globais que afetam os cálculos e simulações.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Taxa de Juros</CardTitle>
					<CardDescription>Defina a taxa de juros padrão a ser usada nos cálculos de parcelamento.</CardDescription>
				</CardHeader>
				<CardContent>
					<InterestRateForm />
				</CardContent>
			</Card>
		</div>
	)
}

export default AdminSettingsPage
