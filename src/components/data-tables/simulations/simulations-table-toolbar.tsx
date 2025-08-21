"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SimulationsTableToolbarProps<TData> {
	table: Table<TData>
}

export const SimulationsTableToolbar = <TData,>({ table }: SimulationsTableToolbarProps<TData>) => {
	const isFiltered = table.getState().columnFilters.length > 0

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder="Filtrar por Cliente..."
					value={(table.getColumn("legal_name")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("legal_name")?.setFilterValue(event.target.value)}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				<Input
					placeholder="Filtrar por CNPJ..."
					value={(table.getColumn("cnpj")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("cnpj")?.setFilterValue(event.target.value)}
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
