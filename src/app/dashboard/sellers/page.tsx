import { SellerTable } from "@/components/data-tables/sellers/seller-table"
import { AddSellerDialog } from "@/components/dialogs/add-seller-dialog"

const SellersPage = () => {
	return (
		<>
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="text-center md:text-left">
					<h1 className="text-3xl font-bold tracking-tight text-foreground">Vendedores</h1>
					<p className="text-muted-foreground">Gerencie os vendedores cadastrados no sistema.</p>
				</div>

				<AddSellerDialog />
			</div>
			<SellerTable />
		</>
	)
}

export default SellersPage
