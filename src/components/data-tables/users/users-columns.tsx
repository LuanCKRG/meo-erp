"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { EditUserPermissionsDialog } from "@/components/dialogs/edit-user-permissions-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/definitions/users"
import { formatDate } from "@/lib/utils"

const ActionsCell = ({ user, canManage }: { user: User; canManage: boolean }) => {
	if (!canManage) {
		return null
	}

	return <EditUserPermissionsDialog user={user} />
}

export const columns = (canManageUsers: boolean): ColumnDef<User>[] => [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Nome
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <div className="text-left font-medium">{row.getValue("name")}</div>
	},
	{
		accessorKey: "email",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Email
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <div className="text-left">{row.getValue("email")}</div>
	},
	{
		accessorKey: "role",
		header: "Função",
		cell: ({ row }) => {
			const role = row.getValue("role") as string
			return (
				<Badge variant="secondary" className="capitalize">
					{role}
				</Badge>
			)
		}
	},
	{
		accessorKey: "created_at",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
				Data de Criação
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => <div>{formatDate(row.getValue("created_at"))}</div>
	},
	{
		id: "actions",
		cell: ({ row }) => {
			return <ActionsCell user={row.original} canManage={canManageUsers} />
		}
	}
]
