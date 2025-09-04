"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Check, Loader2, RefreshCw } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { updateOrderStatus } from "@/actions/orders"
import { DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import type { OrderStatus, OrderWithRelations } from "@/lib/definitions/orders"
import { cn } from "@/lib/utils"

const availableStatuses: { value: OrderStatus; label: string }[] = [
	{ value: "analysis_pending", label: "Ag. Análise" },
	{ value: "pre_analysis", label: "Análise Prévia" },
	{ value: "confirmation_pending", label: "Em Confirmação" },
	{ value: "credit_analysis", label: "Análise de Crédito" },
	{ value: "documents_pending", label: "Ag. Documentos" },
	{ value: "final_analysis", label: "Análise Final" },
	{ value: "approved", label: "Aprovado" },
	{ value: "rejected", label: "Reprovado" },
	{ value: "contract_signing", label: "Assinatura Contrato" },
	{ value: "completed", label: "Finalizado" },
	{ value: "canceled", label: "Cancelado" }
]

export const UpdateOrderStatusDialog = ({ order }: { order: OrderWithRelations }) => {
	const [isPending, startTransition] = useTransition()
	const queryClient = useQueryClient()

	const handleStatusChange = (newStatus: OrderStatus) => {
		if (newStatus === order.status) {
			return
		}

		startTransition(() => {
			toast.promise(updateOrderStatus({ orderId: order.id, status: newStatus }), {
				loading: "Atualizando status...",
				success: (res) => {
					if (res.success) {
						queryClient.invalidateQueries({ queryKey: ["orders"] })
						return res.message
					}
					throw new Error(res.message)
				},
				error: (err: Error) => {
					return err.message || "Ocorreu um erro inesperado."
				}
			})
		})
	}

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger disabled={isPending}>
				{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
				Alterar Status
			</DropdownMenuSubTrigger>
			<DropdownMenuPortal>
				<DropdownMenuSubContent>
					{availableStatuses.map((status) => (
						<DropdownMenuItem key={status.value} onClick={() => handleStatusChange(status.value)}>
							<Check className={cn("mr-2 h-4 w-4", order.status === status.value ? "opacity-100" : "opacity-0")} />
							{status.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	)
}
