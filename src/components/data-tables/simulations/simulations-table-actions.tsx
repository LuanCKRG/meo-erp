"use client"

import { Expand, MoreHorizontal } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { Simulation } from "@/lib/definitions/simulations"
import { formatCnpj, formatPhone } from "@/lib/formatters"
import { formatDate } from "@/lib/utils"

const formatCurrency = (value: number | null | undefined): string => {
	if (value === null || value === undefined) return "N/A"
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(value)
}

const DetailItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
	<div className="grid grid-cols-[150px_1fr] items-center">
		<span className="font-medium text-muted-foreground">{label}</span>
		<span className="break-words">{value || "-"}</span>
	</div>
)

const FullDetailsSheetContent = ({ simulation }: { simulation: Simulation }) => (
	<div className="space-y-6">
		<fieldset className="rounded-lg border p-4">
			<legend className="-ml-1 px-1 text-lg font-medium text-primary">Dados do Projeto</legend>
			<div className="space-y-2 pt-2">
				<DetailItem label="Potência (kWp)" value={simulation.system_power} />
				<DetailItem label="Consumo (kWh)" value={simulation.current_consumption} />
				<DetailItem label="Concessionária" value={simulation.energy_provider} />
				<DetailItem label="Tipo de Estrutura" value={simulation.structure_type} />
				<DetailItem label="Conexão e Tensão" value={simulation.connection_voltage} />
			</div>
		</fieldset>

		<fieldset className="rounded-lg border p-4">
			<legend className="-ml-1 px-1 text-lg font-medium text-primary">Kit de Equipamentos</legend>
			<div className="space-y-2 pt-2">
				<DetailItem label="Módulo" value={`${simulation.kit_module_name}(${simulation.kit_module_brand_name})`} />
				<DetailItem label="Inversor" value={`${simulation.kit_inverter_name}(${simulation.kit_module_brand_name})`} />
				<DetailItem label="Outros" value={simulation.kit_others} />
			</div>
		</fieldset>

		<fieldset className="rounded-lg border p-4">
			<legend className="-ml-1 px-1 text-lg font-medium text-primary">Dados do Cliente</legend>
			<div className="space-y-2 pt-2">
				<DetailItem label="CNPJ" value={formatCnpj(simulation.cnpj)} />
				<DetailItem label="Razão Social" value={simulation.legal_name} />
				<DetailItem label="Data de Fundação" value={formatDate(simulation.incorporation_date)} />
				<DetailItem label="Faturamento Anual" value={formatCurrency(simulation.annual_revenue)} />
			</div>
		</fieldset>

		<fieldset className="rounded-lg border p-4">
			<legend className="-ml-1 px-1 text-lg font-medium text-primary">Contato</legend>
			<div className="space-y-2 pt-2">
				<DetailItem label="Nome" value={simulation.contact_name} />
				<DetailItem label="Celular" value={formatPhone(simulation.contact_phone)} />
				<DetailItem label="Email" value={simulation.contact_email} />
			</div>
		</fieldset>

		<fieldset className="rounded-lg border p-4">
			<legend className="-ml-1 px-1 text-lg font-medium text-primary">Local de Instalação</legend>
			<div className="space-y-2 pt-2">
				<DetailItem label="CEP" value={simulation.cep} />
				<DetailItem label="Endereço" value={`${simulation.street}, ${simulation.number}${simulation.complement ? `, ${simulation.complement}` : ""}`} />
				<DetailItem label="Bairro" value={simulation.neighborhood} />
				<DetailItem label="Cidade/UF" value={`${simulation.city}/${simulation.state}`} />
			</div>
		</fieldset>

		<fieldset className="rounded-lg border p-4">
			<legend className="-ml-1 px-1 text-lg font-medium text-primary">Valores</legend>
			<div className="space-y-2 pt-2">
				<DetailItem label="Equipamentos" value={formatCurrency(simulation.equipment_value)} />
				<DetailItem label="Mão de Obra" value={formatCurrency(simulation.labor_value)} />
				<DetailItem label="Outros Custos" value={formatCurrency(simulation.other_costs)} />
				<DetailItem label="Total" value={formatCurrency(simulation.equipment_value + simulation.labor_value + (simulation.other_costs || 0))} />
			</div>
		</fieldset>

		<fieldset className="rounded-lg border p-4">
			<legend className="-ml-1 px-1 text-lg font-medium text-primary">Criação</legend>
			<div className="space-y-2 pt-2">
				<DetailItem label="Responsável" value={simulation.created_by_name} />
				<DetailItem label="Email do Responsável" value={simulation.created_by_email} />
				<DetailItem label="Data" value={formatDate(simulation.created_at)} />
			</div>
		</fieldset>
	</div>
)

export const SimulationsTableActions = ({ simulation }: { simulation: Simulation }) => {
	const [isSheetOpen, setIsSheetOpen] = useState(false)

	return (
		<div className="flex items-center justify-center space-x-2">
			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetTrigger asChild>
					<Button aria-haspopup="true" size="icon" variant="ghost">
						<Expand className="size-4" />
						<span className="sr-only">Expandir detalhes</span>
					</Button>
				</SheetTrigger>
				<SheetContent className="max-w-full sm:max-w-xl overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Detalhes da Simulação #{simulation.kdi}</SheetTitle>
						<SheetDescription>Visão completa de todos os dados da simulação para o cliente {simulation.legal_name}.</SheetDescription>
					</SheetHeader>
					<div className="py-4">
						<FullDetailsSheetContent simulation={simulation} />
					</div>
				</SheetContent>
			</Sheet>

			{/* <DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button aria-haspopup="true" size="icon" variant="ghost">
						<MoreHorizontal className="size-4" />
						<span className="sr-only">Abrir/Fechar menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Ações</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>Exportar PDF</DropdownMenuItem>
					<DropdownMenuItem className="text-destructive focus:text-destructive">Excluir</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu> */}
		</div>
	)
}
