import { PartnerTable } from "@/components/data-tables/partners/partner-table"
import { AddPartnerDialog } from "@/components/dialogs/add-partner-dialog"

const PartnersPage = () => {
	return (
		<>
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="text-center md:text-left">
					<h1 className="text-3xl font-bold tracking-tight text-foreground">Parceiros</h1>
					<p className="text-muted-foreground">Gerencie os parceiros cadastrados no sistema.</p>
				</div>

				<AddPartnerDialog />
			</div>
			<PartnerTable />
		</>
	)
}

export default PartnersPage
