import { BrandsTable } from "@/components/data-tables/brands/brands-table"
import { StructureTypesTable } from "@/components/data-tables/strutucture-types/structure-types-table"
import { AddBrandDialog } from "@/components/dialogs/add-brand-dialog"
import { AddStructureTypeDialog } from "@/components/dialogs/add-structure-type-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AdminDataPage = () => {
	return (
		<div className="flex flex-col gap-8">
			<div className="space-y-1.5">
				<h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Dados</h1>
				<p className="text-muted-foreground">Visualize e edite os dados que alimentam os formulários de simulação.</p>
			</div>
			<Tabs defaultValue="structures">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="structures">Estruturas</TabsTrigger>
					<TabsTrigger value="brands">Marcas</TabsTrigger>
					<TabsTrigger value="equipments">Equipamentos</TabsTrigger>
				</TabsList>

				<TabsContent value="structures">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Tipos de Estrutura</CardTitle>
									<CardDescription>Gerencie os tipos de estrutura disponíveis para as simulações.</CardDescription>
								</div>
								<AddStructureTypeDialog />
							</div>
						</CardHeader>
						<CardContent>
							<StructureTypesTable />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="brands">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Marcas de Equipamento</CardTitle>
									<CardDescription>Gerencie as marcas dos equipamentos.</CardDescription>
								</div>
								<AddBrandDialog />
							</div>
						</CardHeader>
						<CardContent>
							<BrandsTable />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="equipments">
					<Card>
						<CardHeader>
							<CardTitle>Equipamentos (Kits)</CardTitle>
							<CardDescription>Gerencie os equipamentos individuais que compõem os kits.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							{/* TODO: Implementar tabela para gerenciar Equipamentos */}
							<p className="text-center text-muted-foreground py-8">Tabela de gerenciamento em breve.</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default AdminDataPage
