"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CustomerWithRelations } from "@/lib/definitions/customers"
import { formatCnpj } from "@/lib/formatters"
import { CustomerTableActions } from "./customer-table-actions"

export const columns: ColumnDef<CustomerWithRelations>[] = [
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
		accessorKey: "company_name",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Razão Social
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <div className="text-left font-medium">{row.getValue("company_name")}</div>
	},
	{
		accessorKey: "cnpj",
		header: "CNPJ",
		cell: ({ row }) => formatCnpj(row.getValue("cnpj"))
	},
	{
		accessorKey: "partner_name",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Parceiro
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <div className="text-left">{row.getValue("partner_name")}</div>
	},
	{
		accessorKey: "internal_manager_name",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Gestor Interno
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <div className="text-left">{row.getValue("internal_manager_name") || "-"}</div>
	},
	{
		id: "actions",
		cell: ({ row }) => <CustomerTableActions customer={row.original} />
	}
]
