"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { SimulationsTableActions } from "@/components/data-tables/simulations/simulations-table-actions"
import { Button } from "@/components/ui/button"
import type { Simulation } from "@/lib/definitions/simulations"
import { formatCnpj } from "@/lib/formatters"
import { formatDate } from "@/lib/utils"

export const columns: ColumnDef<Simulation>[] = [
	{
		accessorKey: "kdi",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				KDI
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		)
	},
	{
		accessorKey: "legal_name",
		header: "Cliente"
	},
	{
		accessorKey: "cnpj",
		header: "CNPJ",
		cell: ({ row }) => formatCnpj(row.getValue("cnpj"))
	},
	{
		accessorKey: "system_power",
		header: "Potência (kWp)",
		cell: ({ row }) => `${row.original.system_power} kWp`
	},
	{
		accessorKey: "created_by_name",
		header: "Responsável"
	},
	{
		accessorKey: "created_at",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Data
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => formatDate(row.getValue("created_at"))
	},
	{
		id: "actions",
		cell: ({ row }) => <SimulationsTableActions simulation={row.original} />
	}
]
