"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Check, ChevronsUpDown, Loader2, RefreshCw } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { updateSimulationStatus } from "@/actions/simulations"
import { DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import type { SimulationStatus, SimulationWithRelations } from "@/lib/definitions/simulations"
import { cn } from "@/lib/utils"

const availableStatuses: { value: SimulationStatus; label: string }[] = [
	{ value: "initial_contact", label: "Contato Inicial" },
	{ value: "under_review", label: "Em análise Cliente" },
	{ value: "in_negotiation", label: "Em Negociação" },
	{ value: "won", label: "Ganho" },
	{ value: "lost", label: "Perdido" }
]

export const UpdateStatusDialog = ({ simulation }: { simulation: SimulationWithRelations }) => {
	const [isPending, startTransition] = useTransition()
	const queryClient = useQueryClient()

	const handleStatusChange = (newStatus: SimulationStatus) => {
		if (newStatus === simulation.status) {
			return
		}

		startTransition(() => {
			toast.promise(updateSimulationStatus({ simulationId: simulation.id, status: newStatus }), {
				loading: "Atualizando status...",
				success: (res) => {
					if (res.success) {
						queryClient.invalidateQueries({ queryKey: ["simulations"] })
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
							<Check className={cn("mr-2 h-4 w-4", simulation.status === status.value ? "opacity-100" : "opacity-0")} />
							{status.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuSubContent>
			</DropdownMenuPortal>
		</DropdownMenuSub>
	)
}
