"use client"

import { useQuery } from "@tanstack/react-query"
import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState
} from "@tanstack/react-table"
import { useState } from "react"

import { getAllSimulations } from "@/actions/simulations"
import { columns } from "@/components/data-tables/simulations/simulations-columns"
import { SimulationsTableToolbar } from "@/components/data-tables/simulations/simulations-table-toolbar"
import { DataTable } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"

export const SimulationsTable = () => {
	const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

	const { data, isLoading } = useQuery({
		queryKey: ["simulations"],
		queryFn: getAllSimulations
	})

	const table = useReactTable({
		data: data ?? [],
		columns,
		state: {
			sorting,
			columnVisibility,
			columnFilters
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel()
	})

	const columnNameMap: { [key: string]: string } = {
		kdi: "KDI",
		legal_name: "Cliente",
		cnpj: "CNPJ",
		system_power: "Potência",
		created_by_name: "Responsável",
		created_at: "Data",
		actions: "Ações"
	}

	const toolbar = (
		<div className="flex items-center justify-between">
			<SimulationsTableToolbar table={table} />
			<DataTableViewOptions table={table} columnNameMap={columnNameMap} />
		</div>
	)

	if (isLoading) {
		return <DataTableSkeleton columnCount={columns.length} />
	}

	return <DataTable table={table} toolbar={toolbar} />
}
