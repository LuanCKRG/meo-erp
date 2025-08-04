import { ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
	SidebarMenuItem
} from "@/components/ui/sidebar"

const AppSidebar = () => (
	<Sidebar collapsible="icon" variant="inset">
		<SidebarHeader>
			<Image alt="MEO Ernegia" src="/logo.png" width={300} height={200} />
		</SidebarHeader>

		<Separator className="data-[orientation=horizontal]:h-0.5" />

		<SidebarContent>
			{navItems.map((nav) => (
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
									{nav.items.map(({ icon: Icon, ...item }) => (
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
			))}
		</SidebarContent>

		<SidebarFooter />
	</Sidebar>
)

export { AppSidebar }
