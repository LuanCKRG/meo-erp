"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Edit, Loader2, MoreHorizontal, Send, Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { createOrderFromSimulation } from "@/actions/orders"
import { deleteSimulation } from "@/actions/simulations"
import { EditSimulationDialog } from "@/components/dialogs/edit-simulation-dialog"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import type { SimulationWithRelations } from "@/lib/definitions/simulations"

export const SimulationsTableActions = ({ simulation }: { simulation: SimulationWithRelations }) => {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeletePending, startDeleteTransition] = useTransition()
	const [isCreateOrderPending, startCreateOrderTransition] = useTransition()
	const queryClient = useQueryClient()

	const handleDelete = () => {
		startDeleteTransition(() => {
			toast.promise(
				deleteSimulation({
					simulationId: simulation.id,
					customerId: simulation.customerId
				}),
				{
					loading: "Deletando simulação...",
					success: (res) => {
						queryClient.invalidateQueries({ queryKey: ["simulations"] })
						return res.message
					},
					error: (err) => {
						return err.message
					}
				}
			)
		})
	}

	const handleCreateOrder = () => {
		startCreateOrderTransition(() => {
			toast.promise(createOrderFromSimulation(simulation.id), {
				loading: "Criando pedido...",
				success: (res) => {
					if (res.success) {
						// Você pode querer invalidar uma query de 'pedidos' aqui no futuro
						// queryClient.invalidateQueries({ queryKey: ["orders"] })
						return res.message
					}
					// Lança um erro para ser pego pelo `error` do toast.promise
					throw new Error(res.message)
				},
				error: (err: Error) => {
					return err.message || "Ocorreu um erro inesperado."
				}
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
					<DropdownMenuItem onSelect={handleCreateOrder} disabled={isCreateOrderPending}>
						{isCreateOrderPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
						Criar Pedido
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
						<Edit className="mr-2 h-4 w-4" />
						Editar
					</DropdownMenuItem>
					<DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={handleDelete} disabled={isDeletePending}>
						{isDeletePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
						Deletar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Renderiza o dialog de edição */}
			<EditSimulationDialog simulationId={simulation.id} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
		</>
	)
}
