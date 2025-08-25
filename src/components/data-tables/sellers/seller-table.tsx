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
import { getAllSellers } from "@/actions/sellers"
import { columns } from "@/components/data-tables/sellers/columns"
import { SellerTableToolbar } from "@/components/data-tables/sellers/seller-table-toolbar"
import { DataTable } from "@/components/ui/data-table"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"

const SellerTable = () => {
	const [rowSelection, setRowSelection] = useState({})
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		id: false,
		user_id: false,
		cep: false,
		street: false,
		number: false,
		complement: false,
		neighborhood: false,
		updated_at: false
	})
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading } = useQuery({
		queryKey: ["sellers"],
		queryFn: getAllSellers
	})

	const table = useReactTable({
		data: data ?? [],
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
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
		name: "Nome",
		email: "Email",
		cpf: "CPF",
		phone: "Celular",
		created_at: "Data de Cadastro",
		city: "Cidade",
		state: "Estado",
		status: "Status",
		is_active: "Ativo"
	}

	const toolbar = (
		<div className="flex items-center justify-between">
			<SellerTableToolbar table={table} />
			<DataTableViewOptions table={table} columnNameMap={columnNameMap} />
		</div>
	)

	if (isLoading) {
		return <div>Carregando...</div>
	}

	return <DataTable table={table} toolbar={toolbar} />
}

export { SellerTable }
