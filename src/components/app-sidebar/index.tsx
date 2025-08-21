import { ChevronDown, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getUserPermissions, getCurrentUser } from "@/actions/auth"
import { NavUser } from "@/components/app-sidebar/nav-footer"
import { navItems } from "@/components/app-sidebar/nav-items"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
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
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem
} from "@/components/ui/sidebar"
import type { NavItem, NavSection } from "./nav-items"

const AppSidebar = async () => {
	const userPermissions = await getUserPermissions()
	const userData = await getCurrentUser()

	const filteredNavItems: NavSection[] = navItems
		.map((section): NavSection | null => {
			// Seção some se tiver permissão própria que o user não tem
			if (section.permission && !userPermissions.has(section.permission)) {
				return null
			}

			const filteredItems: (NavItem | null)[] = section.items.map((item) => {
				// Filtra subItems por permissão
				const filteredSubItems = item.subItems ? item.subItems.filter((sub) => !sub.permission || userPermissions.has(sub.permission)) : []

				const hasItemPermission = !item.permission || userPermissions.has(item.permission)

				// Regra: o item pai aparece se o user tiver a permissão do pai OU pelo menos 1 subItem liberado
				if (!hasItemPermission && filteredSubItems.length === 0) {
					return null
				}

				return {
					...item,
					subItems: filteredSubItems.length > 0 ? filteredSubItems : undefined
				}
			})

			const itemsOnly = filteredItems.filter((it): it is NavItem => it !== null)

			if (itemsOnly.length === 0) return null

			return { ...section, items: itemsOnly }
		})
		.filter((s): s is NavSection => s !== null)

	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<Image alt="MEO Ernegia" src="/logo.png" width={300} height={200} />
			</SidebarHeader>

			<Separator className="data-[orientation=horizontal]:h-0.5" />

			<SidebarContent>
				{filteredNavItems.map(
					(nav) =>
						nav && (
							<Collapsible key={nav.id} defaultOpen className="group/collapsible">
								<SidebarGroup>
									<SidebarGroupLabel asChild>
										<CollapsibleTrigger>
											{nav.title}
											<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
										</CollapsibleTrigger>
									</SidebarGroupLabel>

									<CollapsibleContent>
										<SidebarGroupContent>
											<SidebarMenu>
												{nav.items.map(({ icon: Icon, ...item }) =>
													item.subItems && item.subItems.length > 0 ? (
														// Renderiza como um menu expansível se tiver sub-itens
														<Collapsible key={item.title} asChild defaultOpen className="group/collapsible">
															<SidebarMenuItem>
																<CollapsibleTrigger asChild>
																	<SidebarMenuButton tooltip={item.title}>
																		<Icon />
																		<span>{item.title}</span>
																		<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
																	</SidebarMenuButton>
																</CollapsibleTrigger>
																<CollapsibleContent>
																	<SidebarMenuSub>
																		{item.subItems.map((subItem) => (
																			<SidebarMenuSubItem key={subItem.title}>
																				<SidebarMenuSubButton asChild>
																					<Link href={subItem.url}>
																						<span>{subItem.title}</span>
																					</Link>
																				</SidebarMenuSubButton>
																			</SidebarMenuSubItem>
																		))}
																	</SidebarMenuSub>
																</CollapsibleContent>
															</SidebarMenuItem>
														</Collapsible>
													) : (
														// Renderiza como um link simples
														<SidebarMenuItem key={item.title}>
															<SidebarMenuButton asChild>
																<Link href={item.url}>
																	<Icon />
																	<span>{item.title}</span>
																</Link>
															</SidebarMenuButton>
														</SidebarMenuItem>
													)
												)}
											</SidebarMenu>
										</SidebarGroupContent>
									</CollapsibleContent>
								</SidebarGroup>
							</Collapsible>
						)
				)}
			</SidebarContent>

			<SidebarFooter>
				<NavUser
					user={{
						name: userData.name || "Usuário",
						email: userData.email || "email@exemplo.com"
					}}
				/>
			</SidebarFooter>
		</Sidebar>
	)
}

export { AppSidebar }
