"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { getUserPermissionsDetailed, updateUserPermissions } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { PERMISSIONS, type PermissionId } from "@/lib/constants"
import type { User } from "@/lib/definitions/users"
import { useForm } from "react-hook-form"

interface EditUserPermissionsFormProps {
	user: User
	onSuccess: () => void
}

const permissionTranslations: Record<PermissionId, string> = {
	"admin:dashboard:view": "Visualizar Painel Principal",
	"admin:data:manage": "Gerenciar Dados Globais (Equipamentos, Marcas, etc.)",
	"admin:data:view": "Visualizar Dados Globais",
	"admin:settings:manage": "Editar Configurações Gerais (Taxas, etc.)",
	"admin:settings:view": "Visualizar Configurações Gerais",
	"admin:users:manage": "Gerenciar Permissões de Usuários",
	"admin:users:view": "Visualizar Usuários",
	"admin:permissions:manage": "Gerenciar Permissões de Funções",
	"partners:manage": "Gerenciar Parceiros (Aprovar, Rejeitar, Editar)",
	"partners:view": "Visualizar Lista de Parceiros",
	"reports:view": "Visualizar Relatórios",
	"sellers:manage": "Gerenciar Vendedores",
	"sellers:view": "Visualizar Lista de Vendedores",
	"simulations:create": "Criar Novas Simulações",
	"simulations:view": "Ver Simulações Criadas"
}

const resourceTitleTranslations: Record<string, string> = {
	admin: "Administração",
	partners: "Parceiros",
	sellers: "Vendedores",
	reports: "Relatórios",
	simulations: "Simulações"
}

const groupPermissions = (permissions: readonly PermissionId[]) => {
	const grouped = permissions.reduce(
		(acc, permission) => {
			const [resource] = permission.split(":")
			if (!acc[resource]) {
				acc[resource] = []
			}
			acc[resource].push(permission)
			return acc
		},
		{} as Record<string, PermissionId[]>
	)
	return Object.entries(grouped)
}

const getInitialPermissionsState = () => {
	return PERMISSIONS.reduce(
		(acc, permissionId) => {
			acc[permissionId] = false
			return acc
		},
		{} as Record<PermissionId, boolean>
	)
}

export function EditUserPermissionsForm({ user, onSuccess }: EditUserPermissionsFormProps) {
	const [isPending, startTransition] = useTransition()
	const queryClient = useQueryClient()

	const form = useForm({
		defaultValues: getInitialPermissionsState()
	})

	const { data: userPermissions, isLoading } = useQuery({
		queryKey: ["user-permissions", user.id],
		queryFn: () => getUserPermissionsDetailed(user.id),
		enabled: !!user.id
	})

	useEffect(() => {
		if (userPermissions) {
			const initialState = getInitialPermissionsState()
			userPermissions.forEach((p) => {
				if (p.permission_id in initialState) {
					initialState[p.permission_id as PermissionId] = p.effective
				}
			})
			form.reset(initialState)
		}
	}, [userPermissions, form])

	const groupedPermissions = useMemo(() => groupPermissions(PERMISSIONS), [])

	const handleSelectAll = (permissionIds: PermissionId[]) => {
		permissionIds.forEach((id) => {
			form.setValue(id, true)
		})
	}

	function onSubmit(data: Record<PermissionId, boolean>) {
		startTransition(async () => {
			const result = await updateUserPermissions({
				userId: user.id,
				permissions: data
			})

			if (result.success) {
				toast.success(result.message)
				queryClient.invalidateQueries({ queryKey: ["user-permissions", user.id] })
				onSuccess()
			} else {
				toast.error("Erro ao salvar", {
					description: result.message
				})
			}
		})
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="max-h-[60vh] space-y-8 overflow-y-auto pr-4">
					{[1, 2, 3].map((number) => (
						<fieldset key={number} className="rounded-lg border p-4">
							<Skeleton className="h-6 w-1/3" />
							<div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
								{[1, 2, 3, 4].map((n) => (
									<div key={n} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
										<Skeleton className="size-4 rounded" />
										<div className="w-full space-y-2">
											<Skeleton className="h-4 w-5/6" />
										</div>
									</div>
								))}
							</div>
						</fieldset>
					))}
				</div>
				<div className="flex justify-end pt-4">
					<Button disabled>
						<Loader2 className="animate-spin" />
						Carregando...
					</Button>
				</div>
			</div>
		)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="max-h-[60vh] space-y-8 overflow-y-auto pr-4">
					{groupedPermissions.map(([resource, permissionIds]) => (
						<fieldset key={resource} className="rounded-lg border bg-primary-foreground p-4">
							<legend className="-ml-1 px-1 text-lg font-medium text-primary">{resourceTitleTranslations[resource] || resource}</legend>
							<div className="flex justify-end">
								<Button type="button" variant="link" size="sm" onClick={() => handleSelectAll(permissionIds)}>
									Marcar Todos
								</Button>
							</div>
							<div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
								{permissionIds.map((permissionId) => (
									<FormField
										key={permissionId}
										control={form.control}
										name={permissionId}
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border bg-background p-4 shadow-sm">
												<FormControl>
													<Checkbox checked={field.value} onCheckedChange={field.onChange} />
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>{permissionTranslations[permissionId] || permissionId}</FormLabel>
												</div>
											</FormItem>
										)}
									/>
								))}
							</div>
						</fieldset>
					))}
				</div>

				<div className="flex justify-end pt-4">
					<Button type="submit" disabled={isPending}>
						{isPending ? <Loader2 className="animate-spin" /> : <Save />}
						Salvar Permissões
					</Button>
				</div>
			</form>
		</Form>
	)
}
