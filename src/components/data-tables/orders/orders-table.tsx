"use client"

import { useQuery } from "@tanstack/react-query"
import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState
} from "@tanstack/react-table"
import { useState } from "react"

import { getAllOrders } from "@/actions/orders"
import { columns } from "@/components/data-tables/orders/orders-columns"
import { OrdersTableToolbar } from "@/components/data-tables/orders/orders-table-toolbar"
import { DataTable } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"

export const OrdersTable = () => {
	const [sorting, setSorting] = useState<SortingState>([{ id: "created_at", desc: true }])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		status: false
	})

	const { data, isLoading } = useQuery({
		queryKey: ["orders"],
		queryFn: getAllOrders
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
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues()
	})

	const columnNameMap: { [key: string]: string } = {
		kdi: "KDI",
		cnpj: "CNPJ",
		company_name: "Razão Social",
		city: "Cidade",
		state: "Estado",
		partner_name: "Parceiro",
		internal_manager: "Gestor Interno",
		system_power: "Potência (kWp)",
		total_value: "Valor",
		status: "Status",
		created_at: "Data",
		actions: "Ações"
	}

	const toolbar = (
		<div className="flex items-center justify-between">
			<OrdersTableToolbar table={table} />
			<DataTableViewOptions table={table} columnNameMap={columnNameMap} />
		</div>
	)

	if (isLoading) {
		return <DataTableSkeleton columnCount={columns.length} />
	}

	return <DataTable table={table} toolbar={toolbar} />
}
