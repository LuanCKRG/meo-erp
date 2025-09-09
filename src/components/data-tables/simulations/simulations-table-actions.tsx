"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Edit, Eye, FileDown, Loader2, Send, Trash2, RefreshCw } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { hasPermission } from "@/actions/auth"
import { createOrderFromSimulation } from "@/actions/orders"
import { deleteSimulation, generateSimulationPdf } from "@/actions/simulations"
import { EditSimulationDialog } from "@/components/dialogs/edit-simulation-dialog"
import { UpdateStatusDialog } from "@/components/dialogs/update-status-dialog"
import { ViewSimulationSheet } from "@/components/dialogs/view-simulation-sheet"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { SimulationWithRelations } from "@/lib/definitions/simulations"

export const SimulationsTableActions = ({ simulation }: { simulation: SimulationWithRelations }) => {
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isViewSheetOpen, setIsViewSheetOpen] = useState(false)
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
	const [isDeletePending, startDeleteTransition] = useTransition()
	const [isCreateOrderPending, startCreateOrderTransition] = useTransition()
	const [isPdfPending, startPdfTransition] = useTransition()
	const queryClient = useQueryClient()

	const { data: canCreateSimulations } = useQuery({
		queryKey: ["permission", "simulations:create"],
		queryFn: () => hasPermission("simulations:create")
	})

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

	const handleDownloadPdf = () => {
		startPdfTransition(() => {
			toast.promise(generateSimulationPdf(simulation.id), {
				loading: "Gerando PDF da proposta...",
				success: (result) => {
					if (!result.success) {
						throw new Error(result.message)
					}
					// Cria um link temporário para o download
					const link = document.createElement("a")
					link.href = `data:application/pdf;base64,${result.data.pdfBase64}`
					link.download = `proposta-simulacao-${simulation.kdi}.pdf`
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
			<div className="flex items-center justify-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsViewSheetOpen(true)}>
							<Eye className="h-4 w-4" />
							<span className="sr-only">Visualizar</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Visualizar Detalhes</TooltipContent>
				</Tooltip>

				{canCreateSimulations && (
					<>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCreateOrder} disabled={isCreateOrderPending}>
									{isCreateOrderPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
									<span className="sr-only">Criar Pedido</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Criar Pedido</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownloadPdf} disabled={isPdfPending}>
									{isPdfPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
									<span className="sr-only">Baixar Proposta</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Baixar Proposta</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsStatusDialogOpen(true)}>
									<RefreshCw className="h-4 w-4" />
									<span className="sr-only">Alterar Status</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Alterar Status</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditDialogOpen(true)}>
									<Edit className="h-4 w-4" />
									<span className="sr-only">Editar</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Editar Simulação</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-destructive hover:text-destructive"
									onClick={handleDelete}
									disabled={isDeletePending}
								>
									{isDeletePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
									<span className="sr-only">Deletar</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Deletar Simulação</TooltipContent>
						</Tooltip>
					</>
				)}
			</div>

			<EditSimulationDialog simulationId={simulation.id} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
			<ViewSimulationSheet simulationId={simulation.id} open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen} />
			<UpdateStatusDialog simulation={simulation} open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen} />
		</>
	)
}
