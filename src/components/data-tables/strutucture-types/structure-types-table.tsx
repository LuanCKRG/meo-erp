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

import { getStructureTypes } from "@/actions/equipments"
import { DataTable } from "@/components/ui/data-table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import type { StructureType } from "@/lib/definitions/equipments"
import { columns } from "./structure-types-columns"

const StructureTypesTable = () => {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
		id: false,
		updated_at: false
	})
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading } = useQuery<StructureType[]>({
		queryKey: ["structure-types"],
		queryFn: getStructureTypes
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

	if (isLoading) {
		return <DataTableSkeleton columnCount={columns.length} />
	}

	return <DataTable table={table} />
}

export { StructureTypesTable }
