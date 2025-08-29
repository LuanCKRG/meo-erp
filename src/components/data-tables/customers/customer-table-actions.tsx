"use client"

import { MoreHorizontal, Pencil } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { EditCustomerDialog } from "@/components/dialogs/edit-customer-dialog"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { CustomerWithRelations } from "@/lib/definitions/customers"

export const CustomerTableActions = ({ customer }: { customer: CustomerWithRelations }) => {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Abrir menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Ações</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Editar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditCustomerDialog customerId={customer.id} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
		</>
	)
}
