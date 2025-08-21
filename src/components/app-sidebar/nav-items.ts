import { Activity, Briefcase, Handshake, Home, Package, Settings, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface SubNavItem {
	title: string
	url: string
	permission?: string
}

interface NavItem {
	title: string
	url: string
	icon: LucideIcon
	permission?: string // Permissão necessária para ver este item
	subItems?: SubNavItem[]
}

interface NavSection {
	id: number
	title: string
	permission?: string // Permissão necessária para ver a seção inteira
	items: NavItem[]
}

const navItems: NavSection[] = [
	{
		id: 0,
		title: "Admin",
		permission: "admin:dashboard:view",
		items: [
			{ title: "Admin Dashboard", url: "/dashboard/admin", icon: Home, permission: "admin:dashboard:view" },
			{ title: "Gerenciar Dados", url: "/dashboard/admin/data", icon: Package, permission: "admin:data:manage" },
			{ title: "Configurações", url: "/dashboard/admin/settings", icon: Settings, permission: "admin:settings:manage" },
			{ title: "Usuários", url: "/dashboard/admin/users", icon: Users, permission: "admin:users:view" }
		]
	},
	{
		id: 1,
		title: "Operações",
		items: [
			{ title: "Home", url: "/dashboard/home", icon: Home },
			{
				title: "Vendedores",
				url: "/dashboard/sellers",
				icon: Briefcase,
				permission: "sellers:view", // Permissão base para ver o menu
				subItems: [
					{
						title: "Visão Geral",
						url: "/dashboard/sellers",
						permission: "sellers:view"
					},
					{
						title: "Adicionar",
						url: "/dashboard/sellers/add",
						permission: "sellers:manage"
					}
				]
			},
			{
				title: "Parceiros",
				url: "/dashboard/partners",
				icon: Handshake,
				permission: "partners:view",
				subItems: [
					{
						title: "Visão Geral",
						url: "/dashboard/partners",
						permission: "partners:view"
					},
					{
						title: "Adicionar",
						url: "/dashboard/partners/add",
						permission: "partners:manage"
					}
				]
			},
			{
				title: "Simulações",
				url: "/dashboard/simulations",
				icon: Activity,
				permission: "simulations:create",
				subItems: [
					{
						title: "Ver Todas",
						url: "/dashboard/simulations",
						permission: "simulations:view"
					},
					{
						title: "Nova Simulação",
						url: "/dashboard/simulations/add",
						permission: "simulations:create"
					}
				]
			}
		]
	}
]

export { navItems }
export type { NavSection, NavItem, SubNavItem }
