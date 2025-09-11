"use client"

import { useQueryClient } from "@tanstack/react-query"
import { CheckCircle, Eye, Loader2, MoreHorizontal, Pencil, ToggleLeft, ToggleRight, XCircle } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { rejectPartner, setPartnerActiveStatus } from "@/actions/partners"
import { ApprovePartnerDialog } from "@/components/dialogs/approve-partner-dialog"
import { EditPartnerDialog } from "@/components/dialogs/edit-partner-dialog"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Partner } from "@/lib/definitions/partners"
import { formatCep, formatCnpj, formatPhone } from "@/lib/formatters"

const PartnerActions = ({ partner }: { partner: Partner }) => {
	const queryClient = useQueryClient()
	const [isPending, startTransition] = useTransition()
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)

	function handleReject() {
		startTransition(async () => {
			const result = await rejectPartner(partner.id)
			if (result.success) {
				toast.success(result.message)
				queryClient.invalidateQueries({ queryKey: ["partners"] })
			} else {
				toast.error(result.message)
			}
		})
	}

	function handleToggleActive(isActive: boolean) {
		startTransition(async () => {
			const result = await setPartnerActiveStatus({ partnerId: partner.id, isActive })
			if (result.success) {
				toast.success(result.message)
				queryClient.invalidateQueries({ queryKey: ["partners"] })
			} else {
				toast.error(result.message)
			}
		})
	}

	return (
		<>
			<div className="flex items-center justify-center space-x-1">
				<Popover>
					<Tooltip>
						<TooltipTrigger asChild>
							<PopoverTrigger asChild>
								<Button aria-haspopup="true" size="icon" variant="ghost">
									<Eye className="h-4 w-4" />
									<span className="sr-only">Ver detalhes</span>
								</Button>
							</PopoverTrigger>
						</TooltipTrigger>
						<TooltipContent>Ver Detalhes</TooltipContent>
					</Tooltip>
					<PopoverContent className="w-96">
						<div className="grid gap-4 text-left">
							<div className="space-y-2">
								<h4 className="font-medium leading-none">{partner.legal_business_name}</h4>
								<p className="text-sm text-muted-foreground">Detalhes completos do parceiro.</p>
							</div>
							<Separator />
							<div className="grid gap-2 text-sm">
								<h5 className="font-semibold">Dados da Empresa</h5>
								<div className="grid grid-cols-[100px_1fr] items-center">
									<span className="font-medium text-muted-foreground">CNPJ</span>
									<span>{formatCnpj(partner.cnpj)}</span>
								</div>
								<Separator />
								<h5 className="font-semibold pt-2">Contato</h5>
								<div className="grid grid-cols-[100px_1fr] items-center">
									<span className="font-medium text-muted-foreground">Responsável</span>
									<span>{partner.contact_name}</span>
								</div>
								<div className="grid grid-cols-[100px_1fr] items-center">
									<span className="font-medium text-muted-foreground">Celular</span>
									<span>{formatPhone(partner.contact_mobile)}</span>
								</div>
								<div className="grid grid-cols-[100px_1fr] items-center">
									<span className="font-medium text-muted-foreground">Email</span>
									<span>{partner.contact_email}</span>
								</div>
								<Separator />
								<h5 className="font-semibold pt-2">Endereço</h5>
								<div className="grid grid-cols-[100px_1fr] items-center">
									<span className="font-medium text-muted-foreground">CEP</span>
									<span>{formatCep(partner.cep)}</span>
								</div>
								<div className="grid grid-cols-[100px_1fr] items-center">
									<span className="font-medium text-muted-foreground">Logradouro</span>
									<span>
										{partner.street}, {partner.number}
									</span>
								</div>
								{partner.complement && (
									<div className="grid grid-cols-[100px_1fr] items-center">
										<span className="font-medium text-muted-foreground">Complemento</span>
										<span>{partner.complement}</span>
									</div>
								)}
								<div className="grid grid-cols-[100px_1fr] items-center">
									<span className="font-medium text-muted-foreground">Bairro</span>
									<span>{partner.neighborhood}</span>
								</div>
								<div className="grid grid-cols-[100px_1fr] items-center">
									<span className="font-medium text-muted-foreground">Cidade/UF</span>
									<span>
										{partner.city}/{partner.state}
									</span>
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
							<Pencil className="h-4 w-4" />
							<span className="sr-only">Editar Parceiro</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Editar Parceiro</TooltipContent>
				</Tooltip>

				{partner.status === "pending" && (
					<>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" onClick={() => setIsApproveDialogOpen(true)} disabled={isPending}>
									{isPending ? <Loader2 className="h-4 w-4 animate-spin text-green-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
									<span className="sr-only">Aprovar</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Aprovar</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" onClick={handleReject} disabled={isPending}>
									{isPending ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <XCircle className="h-4 w-4 text-destructive" />}
									<span className="sr-only">Rejeitar</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>Rejeitar</TooltipContent>
						</Tooltip>
					</>
				)}

				{partner.status === "approved" &&
					(partner.is_active ? (
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
			<EditPartnerDialog partner={partner} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
			<ApprovePartnerDialog partner={partner} open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen} />
		</>
	)
}

export { PartnerActions }
