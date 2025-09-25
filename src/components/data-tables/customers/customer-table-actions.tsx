"use client"

import { Pencil } from "lucide-react"
import { useState } from "react"

import { EditCustomerDialog } from "@/components/dialogs/edit-customer-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { CustomerWithRelations } from "@/lib/definitions/customers"

export const CustomerTableActions = ({ customer }: { customer: CustomerWithRelations }) => {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

	return (
		<>
			<div className="flex items-center justify-center space-x-1 alternative-buttons-no-trash">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
							<Pencil className="h-4 w-4" />
							<span className="sr-only">Editar Cliente</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Editar Cliente</TooltipContent>
				</Tooltip>
			</div>

			<EditCustomerDialog customerId={customer.id} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
		</>
	)
}
