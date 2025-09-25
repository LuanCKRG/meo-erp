"use client"

import { useQueryClient } from "@tanstack/react-query"
import { CheckCircle, Loader2, Pencil, ToggleLeft, ToggleRight, XCircle } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { approveSeller, rejectSeller, setSellerActiveStatus } from "@/actions/sellers"
import { EditSellerDialog } from "@/components/dialogs/edit-seller-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
			<div className="flex items-center justify-center">
				<div className="contents alternative-buttons-no-trash space-x-1">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
								<Pencil className="h-4 w-4" />
								<span className="sr-only">Editar Vendedor</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Editar Vendedor</TooltipContent>
					</Tooltip>

					{seller.status === "approved" &&
						(seller.is_active ? (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="icon" onClick={() => handleToggleActive(false)} disabled={isPending}>
										{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ToggleLeft className="h-4 w-4" />}
										<span className="sr-only">Inativar</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Inativar</TooltipContent>
							</Tooltip>
						) : (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button variant="ghost" size="icon" onClick={() => handleToggleActive(true)} disabled={isPending}>
										{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ToggleRight className="h-4 w-4" />}
										<span className="sr-only">Reativar</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Reativar</TooltipContent>
							</Tooltip>
						))}
				</div>

				{seller.status === "pending" && (
					<>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									className="ml-2 p-0 rounded-full hover:bg-green-500 group"
									variant="ghost"
									size="icon"
									onClick={() => handleApprovalAction("approve")}
									disabled={isPending}
								>
									{isPending ? (
										<Loader2 className="size-6 animate-spin text-green-500 group-hover:text-white" />
									) : (
										<CheckCircle className="size-6 text-green-500 group-hover:text-white" />
									)}
									<span className="sr-only">Aprovar</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Aprovar</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									className="ml-1 rounded-full hover:bg-destructive group"
									variant="ghost"
									size="icon"
									onClick={() => handleApprovalAction("reject")}
									disabled={isPending}
								>
									{isPending ? (
										<Loader2 className="size-6 animate-spin text-destructive group-hover:text-white" />
									) : (
										<XCircle className="size-6 text-destructive group-hover:text-white" />
									)}
									<span className="sr-only">Rejeitar</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Rejeitar</TooltipContent>
						</Tooltip>
					</>
				)}
			</div>

			<EditSellerDialog seller={seller} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
		</>
	)
}

export { SellerActions }
