"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Edit, MoreHorizontal, Trash2, Loader2, FileDown } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { deleteOrder, generateOrderPdf } from "@/actions/orders"
import { EditOrderDialog } from "@/components/dialogs/edit-order-dialog"
import { UpdateOrderStatusDialog } from "@/components/dialogs/update-order-status-dialog"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { OrderWithRelations } from "@/lib/definitions/orders"

export const OrdersTableActions = ({ order }: { order: OrderWithRelations }) => {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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
					<DropdownMenuItem onSelect={handleDownloadPdf} disabled={isPdfPending}>
						{isPdfPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
						Baixar Proposta
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<UpdateOrderStatusDialog order={order} />
					<DropdownMenuSeparator />
					<DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={handleDelete} disabled={isDeletePending}>
						{isDeletePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
						Deletar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<EditOrderDialog orderId={order.id} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
		</>
	)
}
