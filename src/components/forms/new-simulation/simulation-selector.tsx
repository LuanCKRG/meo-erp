"use client"

import { useQuery } from "@tanstack/react-query"

import { getPartnersBySellerId } from "@/actions/partners"
import { getAllApprovedSellers } from "@/actions/sellers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useSimulation } from "@/contexts/simulation-context"
import type { Database } from "@/lib/definitions/supabase"

type UserRole = Database["public"]["Enums"]["user_role"]

interface SimulationSelectorProps {
	role: UserRole
}

export function SimulationSelector({ role }: SimulationSelectorProps) {
	const { setSellerId, setPartnerId, setPartnerName, setSellerName, sellerId, partnerId } = useSimulation()

	const { data: sellers = [], isLoading: isLoadingSellers } = useQuery({
		queryKey: ["approved-sellers"],
		queryFn: getAllApprovedSellers,
		enabled: role === "admin"
	})

	const { data: partners = [], isLoading: isLoadingPartners } = useQuery({
		queryKey: ["partners-by-seller", sellerId],
		queryFn: () => (sellerId ? getPartnersBySellerId(sellerId) : Promise.resolve([])),
		enabled: !!sellerId
	})

	const handleSellerChange = (newSellerId: string) => {
		const seller = sellers.find((s) => s.id === newSellerId)
		setSellerId(newSellerId)
		setSellerName(seller?.name.split(" ")[0] || null) // Pega o primeiro nome

		// Limpa a seleção de parceiro ao trocar o vendedor
		setPartnerId(null)
		setPartnerName(null)
	}

	const handlePartnerChange = (newPartnerId: string) => {
		const partner = partners.find((p) => p.id === newPartnerId)
		setPartnerId(newPartnerId)
		setPartnerName(partner?.legal_business_name || null)
	}

	return (
		<Card className="mx-auto w-full border-0 border-b shadow-none rounded-none mb-8 pb-8">
			<CardHeader className="p-0">
				<CardTitle>Contexto da Simulação</CardTitle>
				<CardDescription>Para quem esta simulação está sendo criada?</CardDescription>
			</CardHeader>
			<CardContent className="p-0 pt-4 grid md:grid-cols-2 gap-6 items-start">
				{role === "admin" && (
					<div className="space-y-2">
						<Label htmlFor="seller-select">Vendedor Responsável</Label>
						{isLoadingSellers ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={sellerId || ""} onValueChange={handleSellerChange}>
								<SelectTrigger id="seller-select">
									<SelectValue placeholder="Selecione um vendedor" />
								</SelectTrigger>
								<SelectContent>
									{sellers.map((seller) => (
										<SelectItem key={seller.id} value={seller.id}>
											{seller.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
				)}

				{(role === "admin" || role === "seller") && (
					<div className="space-y-2">
						<Label htmlFor="partner-select">Parceiro</Label>
						{isLoadingPartners && sellerId ? (
							<Skeleton className="h-10 w-full" />
						) : (
							<Select value={partnerId || ""} onValueChange={handlePartnerChange} disabled={isLoadingPartners || !sellerId || partners.length === 0}>
								<SelectTrigger id="partner-select">
									<SelectValue
										placeholder={!sellerId ? "Selecione um vendedor primeiro" : partners.length === 0 ? "Nenhum parceiro encontrado" : "Selecione um parceiro"}
									/>
								</SelectTrigger>
								<SelectContent>
									{partners.map((partner) => (
										<SelectItem key={partner.id} value={partner.id}>
											{partner.legal_business_name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
