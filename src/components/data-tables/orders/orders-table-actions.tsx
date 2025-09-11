"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Eye, FileDown, Loader2, RefreshCw, Trash2, Edit } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { deleteOrder, generateOrderPdf } from "@/actions/orders"
import { EditOrderDialog } from "@/components/dialogs/edit-order-dialog"
import { UpdateOrderStatusDialog } from "@/components/dialogs/update-order-status-dialog"
import { ViewOrderSheet } from "@/components/dialogs/view-order-sheet"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { OrderWithRelations } from "@/lib/definitions/orders"

export const OrdersTableActions = ({ order }: { order: OrderWithRelations }) => {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
	const [isViewSheetOpen, setIsViewSheetOpen] = useState(false)
	const [isDeletePending, startDeleteTransition] = useTransition()
	const [isPdfPending, startPdfTransition] = useTransition()
	const queryClient = useQueryClient()

	const handleDelete = () => {
		startDeleteTransition(() => {
			toast.promise(deleteOrder(order.id), {
				loading: "Deletando pedido...",
				success: (res) => {
					if (res.success) {
						queryClient.invalidateQueries({ queryKey: ["orders"] })
						return res.message
					}
					throw new Error(res.message)
				},
				error: (err: Error) => err.message
			})
		})
	}

	const handleDownloadPdf = () => {
		startPdfTransition(() => {
			toast.promise(generateOrderPdf(order.id), {
				loading: "Gerando PDF da proposta...",
				success: (result) => {
					if (!result.success) {
						throw new Error(result.message)
					}
					// Cria um link temporário para o download
					const link = document.createElement("a")
					link.href = `data:application/pdf;base64,${result.data.pdfBase64}`
					link.download = `proposta-pedido-${order.kdi}.pdf`
					document.body.appendChild(link)
					link.click()
					document.body.removeChild(link)

					return "PDF gerado com sucesso! O download deve começar em breve."
				},
				error: (err: Error) => err.message
			})
		})
	}

	return (
		<>
			<div className="flex items-center justify-center space-x-1">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={() => setIsViewSheetOpen(true)}>
							<Eye className="h-4 w-4" />
							<span className="sr-only">Visualizar Detalhes</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Visualizar Detalhes</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
							<Edit className="h-4 w-4" />
							<span className="sr-only">Editar Pedido</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Editar Pedido</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={() => setIsStatusDialogOpen(true)}>
							<RefreshCw className="h-4 w-4" />
							<span className="sr-only">Alterar Status</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Alterar Status</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={handleDownloadPdf} disabled={isPdfPending}>
							{isPdfPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
							<span className="sr-only">Baixar Proposta</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Baixar Proposta PDF</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeletePending}>
							{isDeletePending ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <Trash2 className="h-4 w-4 text-destructive" />}
							<span className="sr-only">Deletar</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Deletar Pedido</TooltipContent>
				</Tooltip>
			</div>

			<EditOrderDialog orderId={order.id} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
			<UpdateOrderStatusDialog order={order} open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen} />
			<ViewOrderSheet orderId={order.id} open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen} />
		</>
	)
}
