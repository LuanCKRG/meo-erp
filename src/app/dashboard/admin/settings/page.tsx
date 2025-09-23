import { RateForm } from "@/components/forms/rate-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const AdminSettingsPage = () => {
	return (
		<div className="flex flex-col gap-8">
			<div className="space-y-1.5">
				<h1 className="text-3xl font-bold tracking-tight">Configurações Gerais</h1>
				<p className="text-muted-foreground">Ajuste os parâmetros globais que afetam os cálculos e simulações.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<Card>
					<CardHeader>
						<CardTitle>Taxa de Juros</CardTitle>
						<CardDescription>Defina a taxa de juros padrão a ser usada nos cálculos de parcelamento.</CardDescription>
					</CardHeader>
					<CardContent>
						<RateForm rateId="interest_rate" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Taxa de Serviços</CardTitle>
						<CardDescription>Defina a taxa de serviços a ser aplicada sobre o subtotal do projeto.</CardDescription>
					</CardHeader>
					<CardContent>
						<RateForm rateId="service_fee" />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default AdminSettingsPage
