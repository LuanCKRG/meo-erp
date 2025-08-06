import { Briefcase, FileChartLine, Handshake, Home, Package, Settings, Users, Activity } from "lucide-react"

const navItems = [
	{
		id: 0,
		title: "Admin",
		items: [
			{ title: "Admin Dashboard", url: "/dashboard/admin", icon: Home },
			{ title: "Gerenciar Dados", url: "/dashboard/admin/data", icon: Package },
			{ title: "Configurações", url: "/dashboard/admin/settings", icon: Settings }
			// { title: "Usuários", url: "/dashboard/admin/users", icon: Users }
		]
	},
	{
		id: 1,
		title: "Operações",
		items: [
			{ title: "Home", url: "/dashboard/home", icon: Handshake },
			{ title: "Vendedores", url: "/dashboard/sellers", icon: Briefcase },
			{ title: "Parceiros", url: "/dashboard/partners", icon: Handshake },
			{ title: "Simulações", url: "/dashboard/simulations", icon: Activity }
			// { title: "Relatórios", url: "/dashboard/reports", icon: FileChartLine },
			// { title: "Configurações", url: "/dashboard/settings", icon: Settings }
		]
	}
]

export { navItems }
