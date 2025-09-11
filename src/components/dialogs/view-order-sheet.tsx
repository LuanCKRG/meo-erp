/** biome-ignore-all lint/suspicious/noArrayIndexKey: <Don't need this rule> */

"use client"

import { useQuery } from "@tanstack/react-query"
import { Building, Factory, FileText, Landmark, Mail, MapPin, Package, Phone, TrendingUp, User, Wallet, NotebookText, AlertTriangle } from "lucide-react"

import { getOrderById } from "@/actions/orders"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCep, formatCnpj, formatPhone } from "@/lib/formatters"
import { formatDate } from "@/lib/utils"

interface ViewOrderSheetProps {
	orderId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value?: string | number | null }) => {
	if (!value) return null
	return (
		<div className="flex items-start gap-3">
			<Icon className="size-4 text-muted-foreground mt-1 flex-shrink-0" />
			<div className="flex flex-col">
				<span className="text-sm text-muted-foreground">{label}</span>
				<span className="font-medium text-foreground">{value}</span>
			</div>
		</div>
	)
}

const formatCurrency = (value: number | null | undefined): string => {
	if (value === null || value === undefined) return "N/A"
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(value)
}

function SheetSkeleton() {
	return (
		<div className="p-6 space-y-6">
			<SheetHeader className="p-0 space-y-2 text-left bg-muted/30 border-b">
				<Skeleton className="h-6 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
			</SheetHeader>
			<div className="space-y-4">
				{[...Array(4)].map((_, i) => (
					<div key={i}>
						<Skeleton className="h-5 w-1/3 mb-4" />
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{[...Array(4)].map((_, j) => (
								<div key={j} className="flex items-start gap-3">
									<Skeleton className="size-5 rounded-full mt-1" />
									<div className="flex-1 space-y-1">
										<Skeleton className="h-4 w-1/3" />
										<Skeleton className="h-5 w-2/3" />
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export function ViewOrderSheet({ orderId, open, onOpenChange }: ViewOrderSheetProps) {
	const {
		data: queryData,
		isLoading,
		isError,
		error
	} = useQuery({
		queryKey: ["order-details", orderId],
		queryFn: () => getOrderById(orderId),
		enabled: open,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false
	})

	const order = queryData?.success ? queryData.data : null
	const customer = order?.customer

	const totalValue = order?.equipment_value && order?.labor_value ? (order.equipment_value || 0) + (order.labor_value || 0) + (order.other_costs || 0) : 0

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-lg p-0 overflow-y-auto">
				{isLoading ? (
					<SheetSkeleton />
				) : isError || !order || !customer ? (
					<>
						<SheetHeader className="p-6 space-y-2 text-left bg-muted/30 border-b">
							<SheetTitle className="text-xl flex items-center gap-2">
								<AlertTriangle className="size-5 text-destructive" />
								Erro ao Carregar Pedido
							</SheetTitle>
							<SheetDescription>Não foi possível buscar as informações. Tente novamente.</SheetDescription>
						</SheetHeader>
						<div className="p-6">
							<p className="text-destructive-foreground bg-destructive/10 p-4 rounded-md">
								{queryData?.message || (error as Error)?.message || "Ocorreu um erro inesperado."}
							</p>
						</div>
					</>
				) : (
					<>
						<SheetHeader className="p-6 space-y-2 text-left bg-muted/30 border-b">
							<SheetTitle className="text-xl">Detalhes do Pedido #{order.kdi}</SheetTitle>
							<SheetDescription>Criado em {formatDate(order.created_at)}</SheetDescription>
						</SheetHeader>
						<div className="p-6 space-y-6">
							{/* Dados do Cliente */}
							<div className="space-y-4">
								<h3 className="font-semibold text-lg flex items-center gap-2">
									<Building className="size-5" /> Dados do Cliente
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 pl-2 border-l-2 border-primary/20">
									<DetailItem icon={Factory} label="Razão Social" value={customer.company_name} />
									<DetailItem icon={FileText} label="CNPJ" value={formatCnpj(customer.cnpj)} />
									<DetailItem icon={User} label="Responsável" value={customer.contact_name} />
									<DetailItem icon={Phone} label="Celular" value={formatPhone(customer.contact_phone)} />
									<DetailItem icon={Mail} label="Email" value={customer.contact_email} />
									<DetailItem icon={Wallet} label="Faturamento Anual" value={formatCurrency(customer.annual_revenue)} />
								</div>
							</div>

							<Separator />

							{/* Endereço de Instalação */}
							<div className="space-y-4">
								<h3 className="font-semibold text-lg flex items-center gap-2">
									<MapPin className="size-5" /> Endereço de Instalação
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 pl-2 border-l-2 border-primary/20">
									<DetailItem icon={Landmark} label="CEP" value={formatCep(customer.postal_code)} />
									<DetailItem icon={MapPin} label="Logradouro" value={`${customer.street}, ${customer.number}`} />
									<DetailItem icon={MapPin} label="Bairro" value={customer.neighborhood} />
									<DetailItem icon={MapPin} label="Cidade/UF" value={`${customer.city} / ${customer.state}`} />
									{customer.complement && <DetailItem icon={MapPin} label="Complemento" value={customer.complement} />}
								</div>
							</div>

							<Separator />

							{/* Dados do Projeto */}
							<div className="space-y-4">
								<h3 className="font-semibold text-lg flex items-center gap-2">
									<TrendingUp className="size-5" /> Dados do Projeto
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 pl-2 border-l-2 border-primary/20">
									<DetailItem icon={TrendingUp} label="Potência do Sistema" value={`${order.system_power} kWp`} />
									<DetailItem icon={TrendingUp} label="Consumo Atual" value={`${order.current_consumption} kWh`} />
									<DetailItem icon={FileText} label="Concessionária" value={order.energy_provider} />
									<DetailItem icon={FileText} label="Tipo de Estrutura" value={order.structure_type_name} />
									<DetailItem icon={FileText} label="Tensão da Conexão" value={order.connection_voltage} />
									{order.notes && (
										<div className="pt-2 col-span-1 sm:col-span-2">
											<DetailItem icon={NotebookText} label="Observações" value={order.notes} />
										</div>
									)}
								</div>
							</div>

							<Separator />

							{/* Kits e Valores */}
							<div className="space-y-4">
								<h3 className="font-semibold text-lg flex items-center gap-2">
									<Package className="size-5" /> Kits e Valores
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 pl-2 border-l-2 border-primary/20">
									<DetailItem icon={Wallet} label="Valor dos Equipamentos" value={formatCurrency(order.equipment_value)} />
									<DetailItem icon={Wallet} label="Valor da Mão de Obra" value={formatCurrency(order.labor_value)} />
									<DetailItem icon={Wallet} label="Outros Custos" value={formatCurrency(order.other_costs)} />
									<div className="sm:col-span-2">
										<DetailItem icon={Wallet} label="Valor Total do Investimento" value={formatCurrency(totalValue)} />
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	)
}
