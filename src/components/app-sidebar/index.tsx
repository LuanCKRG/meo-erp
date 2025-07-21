import { Briefcase, Calendar, ChevronDown, FileChartLine, Handshake, Home, Inbox, Search, Settings } from "lucide-react"
import Link from "next/link"
import { NavAdmin } from "@/components/app-sidebar/nav/nav-admin"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

// Menu items.
const items = [
	{
		title: "Home",
		url: "/dashboard/home",
		icon: Handshake
	},
	{
		title: "Vendedores",
		url: "/dashboard/sellers",
		icon: Briefcase
	},
	{
		title: "Parceiros",
		url: "/dashboard/partners",
		icon: Handshake
	},
	{
		title: "Relatórios",
		url: "/dashboard/reports",
		icon: FileChartLine
	},
	{
		title: "Search",
		url: "#",
		icon: Search
	},
	{
		title: "Configurações",
		url: "/dashboard/settings",
		icon: Settings
	}
]

export const AppSidebar = () => {
	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader />

			<SidebarContent>
				{/* <NavAdmin /> */}

				<SidebarGroup>
					<SidebarGroupLabel>Admin</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu>
							{items.map(({ icon: Icon, ...item }) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link href={item.url}>
											<Icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<Collapsible defaultOpen className="group/collapsible">
					<SidebarGroup>
						<SidebarGroupLabel asChild>
							<CollapsibleTrigger>
								Configurações
								<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
							</CollapsibleTrigger>
						</SidebarGroupLabel>
						<CollapsibleContent>
							<SidebarGroupContent>
								<SidebarMenu>
									{items.map(({ icon: Icon, ...item }) => (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton asChild>
												<Link href={item.url}>
													<Icon />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</CollapsibleContent>
					</SidebarGroup>
				</Collapsible>
			</SidebarContent>

			<SidebarFooter />
		</Sidebar>
	)
}
