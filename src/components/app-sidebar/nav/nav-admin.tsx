"use client"

import { ChevronRight, Handshake, type LucideIcon, Users } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem
} from "@/components/ui/sidebar"

const items = [
	{
		title: "Parceiros",
		url: "#",
		icon: Handshake,
		isActive: true,
		items: [
			{
				title: "Visão Geral",
				url: "/dashboard/partners"
			},
			{
				title: "Adicionar",
				url: "/dashboard/partners/add"
			},
			{
				title: "Importar",
				url: "#"
			}
		]
	},
	{
		title: "Vendedores",
		url: "#",
		icon: Users,
		items: [
			{
				title: "Visão Geral",
				url: "/dashboard/sellers"
			},
			{
				title: "Adicionar",
				url: "/dashboard/sellers/add"
			},
			{
				title: "Importar",
				url: "#"
			}
		]
	}
]

export const NavAdmin = () => {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Admin</SidebarGroupLabel>

			<SidebarMenu>
				{items.map((item) => (
					<Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip={item.title}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>

							<CollapsibleContent>
								<SidebarMenuSub>
									{item.items?.map((subItem) => (
										<SidebarMenuSubItem key={subItem.title}>
											<SidebarMenuSubButton asChild>
												<a href={subItem.url}>
													<span>{subItem.title}</span>
												</a>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	)
}
