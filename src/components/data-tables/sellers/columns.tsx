"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Seller } from "@/lib/definitions/sellers"
import { formatCpf, formatPhone } from "@/lib/formatters"
import { formatDate } from "@/lib/utils"

export const columns: ColumnDef<Seller>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: "name",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Nome
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => <div className="text-left">{row.getValue("name")}</div>
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => <div className="text-left">{row.getValue("email")}</div>
	},
	{
		accessorKey: "cpf",
		header: "CPF",
		cell: ({ row }) => formatCpf(row.original.cpf)
	},
	{
		accessorKey: "phone",
		header: "Celular",
		cell: ({ row }) => formatPhone(row.original.phone)
	},
	{
		accessorKey: "created_at",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
					Data de Cadastro
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		cell: ({ row }) => {
			return formatDate(row.getValue("created_at"))
		}
	},
	{
		accessorKey: "city",
		header: "Cidade",
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		}
	},
	{
		accessorKey: "state",
		header: "Estado",
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		}
	}
]
