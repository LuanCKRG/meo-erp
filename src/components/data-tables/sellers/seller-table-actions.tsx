"use client"

import { useQueryClient } from "@tanstack/react-query"
import { CheckCircle, MoreHorizontal, Pencil, ToggleLeft, ToggleRight, XCircle } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { approveSeller, rejectSeller, setSellerActiveStatus } from "@/actions/sellers"
import { EditSellerDialog } from "@/components/dialogs/edit-seller-dialog"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { Seller } from "@/lib/definitions/sellers"

const SellerActions = ({ seller }: { seller: Seller }) => {
	const queryClient = useQueryClient()
	const [isPending, startTransition] = useTransition()
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

	function handleApprovalAction(action: "approve" | "reject") {
		startTransition(async () => {
			const actionPromise = action === "approve" ? approveSeller(seller.id) : rejectSeller(seller.id)
			const result = await actionPromise

			if (result.success) {
				toast.success(result.message)
				queryClient.invalidateQueries({ queryKey: ["sellers"] })
			} else {
				toast.error(result.message)
			}
		})
	}

	function handleToggleActive(isActive: boolean) {
		startTransition(async () => {
			const result = await setSellerActiveStatus({ sellerId: seller.id, isActive })
			if (result.success) {
				toast.success(result.message)
				queryClient.invalidateQueries({ queryKey: ["sellers"] })
			} else {
				toast.error(result.message)
			}
		})
	}

	return (
		<>
			<div className="flex items-center justify-center space-x-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button aria-haspopup="true" size="icon" variant="ghost">
							<MoreHorizontal className="size-4" />
							<span className="sr-only">Abrir/Fechar menu</span>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end" side="left">
						<DropdownMenuLabel>Ações</DropdownMenuLabel>
						<DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
							<Pencil />
							Editar
						</DropdownMenuItem>
						<DropdownMenuSeparator />

						{seller.status === "pending" && (
							<>
								<DropdownMenuItem onSelect={() => handleApprovalAction("approve")} disabled={isPending}>
									<CheckCircle />
									Aprovar
								</DropdownMenuItem>
								<DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleApprovalAction("reject")} disabled={isPending}>
									<XCircle />
									Rejeitar
								</DropdownMenuItem>
							</>
						)}

						{seller.status === "approved" &&
							(seller.is_active ? (
								<DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleToggleActive(false)} disabled={isPending}>
									<ToggleLeft />
									Inativar
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem onClick={() => handleToggleActive(true)} disabled={isPending}>
									<ToggleRight />
									Reativar
								</DropdownMenuItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<EditSellerDialog seller={seller} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
		</>
	)
}

export { SellerActions }
