"use client"

import { Edit, MoreHorizontal } from "lucide-react"
import { useState } from "react"

import { EditOrderDialog } from "@/components/dialogs/edit-order-dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { OrderWithRelations } from "@/lib/definitions/orders"

export const OrdersTableActions = ({ order }: { order: OrderWithRelations }) => {
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
					<DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
						<Edit className="mr-2 h-4 w-4" />
						Editar Pedido
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditOrderDialog orderId={order.id} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
		</>
	)
}
