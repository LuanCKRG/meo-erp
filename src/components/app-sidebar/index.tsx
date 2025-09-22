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
import { AppSidebarContent } from "./app-sidebar-wrapper"

const AppSidebar = async () => {
	const userPermissions = await getUserPermissions()
	const userData = await getCurrentUser()

	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader>
				<Image alt="MEO Ernegia" src="/logo.png" width={300} height={200} />
			</SidebarHeader>
			<Separator className="data-[orientation=horizontal]:h-0.5" />
			<AppSidebarContent userPermissions={[...userPermissions]} />
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
