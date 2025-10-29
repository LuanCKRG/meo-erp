import type { LucideIcon } from "lucide-react"
import { Activity, Briefcase, Building, FileText, Handshake, Home, Package, Settings, User, Users } from "lucide-react"

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
		title: "Operações",
		items: [
			{ title: "Home", url: "/dashboard/home", icon: Home },
			{
				title: "Vendedores",
				url: "/dashboard/sellers",
				icon: Briefcase,
				permission: "sellers:view" // Permissão base para ver o menu
			},
			{
				title: "Parceiros",
				url: "/dashboard/partners",
				icon: Handshake,
				permission: "partners:view"
			},
			{
				title: "Clientes",
				url: "/dashboard/customers",
				icon: Building,
				permission: "simulations:view" // Reutilizando uma permissão por enquanto
			},
			{
				title: "Simulações",
				url: "/dashboard/simulations",
				icon: Activity,
				permission: "simulations:view"
			},
			{
				title: "Pedidos",
				url: "/dashboard/orders",
				icon: FileText,
				permission: "orders:view"
			}
		]
	},
	{
		id: 1,
		title: "Admin",
		permission: "admin:dashboard:view",
		items: [
			{ title: "Admin Dashboard", url: "/dashboard/admin", icon: Home, permission: "admin:dashboard:view" },
			{ title: "Gerenciar Dados", url: "/dashboard/admin/data", icon: Package, permission: "admin:data:manage" },
			{ title: "Configurações", url: "/dashboard/admin/settings", icon: Settings, permission: "admin:settings:manage" },
			{ title: "Usuários", url: "/dashboard/admin/users", icon: User, permission: "admin:users:view" },
			{ title: "Grupos", url: "/dashboard/admin/groups", icon: Users, permission: "admin:users:view" }
		]
	}
]

export { navItems }
export type { NavSection, NavItem, SubNavItem }
