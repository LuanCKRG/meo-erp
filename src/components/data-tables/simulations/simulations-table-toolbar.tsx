"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { Input } from "@/components/ui/input"
import type { SimulationWithRelations } from "@/lib/definitions/simulations"

interface SimulationsTableToolbarProps<TData> {
	table: Table<TData>
}

export const SimulationsTableToolbar = <TData,>({ table }: SimulationsTableToolbarProps<TData>) => {
	const isFiltered = table.getState().columnFilters.length > 0

	const uniqueCities = useMemo(() => {
		const cities = new Set<string>()
		table.getCoreRowModel().rows.forEach((row) => {
			const city = (row.original as SimulationWithRelations).city
			if (city) cities.add(city)
		})
		return Array.from(cities).map((city) => ({ label: city, value: city }))
	}, [table.getCoreRowModel().rows])

	const uniqueStates = useMemo(() => {
		const states = new Set<string>()
		table.getCoreRowModel().rows.forEach((row) => {
			const state = (row.original as SimulationWithRelations).state
			if (state) states.add(state)
		})
		return Array.from(states).map((state) => ({ label: state, value: state }))
	}, [table.getCoreRowModel().rows])

	const uniquePartners = useMemo(() => {
		const partners = new Set<string>()
		table.getCoreRowModel().rows.forEach((row) => {
			const partner = (row.original as SimulationWithRelations).partner_name
			if (partner) partners.add(partner)
		})
		return Array.from(partners).map((partner) => ({ label: partner, value: partner }))
	}, [table.getCoreRowModel().rows])

	const uniqueManagers = useMemo(() => {
		const managers = new Set<string>()
		table.getCoreRowModel().rows.forEach((row) => {
			const manager = (row.original as SimulationWithRelations).internal_manager
			if (manager) managers.add(manager)
		})
		return Array.from(managers).map((manager) => ({ label: manager, value: manager }))
	}, [table.getCoreRowModel().rows])

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder="Filtrar por Razão Social..."
					value={(table.getColumn("company_name")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("company_name")?.setFilterValue(event.target.value)}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				{table.getColumn("state") && <DataTableFacetedFilter column={table.getColumn("state")} title="Estado" options={uniqueStates} />}
				{table.getColumn("city") && <DataTableFacetedFilter column={table.getColumn("city")} title="Cidade" options={uniqueCities} />}
				{table.getColumn("partner_name") && <DataTableFacetedFilter column={table.getColumn("partner_name")} title="Parceiro" options={uniquePartners} />}
				{table.getColumn("internal_manager") && (
					<DataTableFacetedFilter column={table.getColumn("internal_manager")} title="Gestor Interno" options={uniqueManagers} />
				)}
				{isFiltered && (
					<Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
						Limpar
						<X className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	)
}
