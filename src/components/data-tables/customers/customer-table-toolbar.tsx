"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CustomerTableToolbarProps<TData> {
	table: Table<TData>
}

export const CustomerTableToolbar = <TData,>({ table }: CustomerTableToolbarProps<TData>) => {
	const isFiltered = table.getState().columnFilters.length > 0

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder="Filtrar por Razão Social..."
					value={(table.getColumn("company_name")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("company_name")?.setFilterValue(event.target.value)}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				<Input
					placeholder="Filtrar por Parceiro..."
					value={(table.getColumn("partner_name")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("partner_name")?.setFilterValue(event.target.value)}
					className="h-8 w-[150px] lg:w-[250px]"
				/>

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
