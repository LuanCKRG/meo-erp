import { cookies } from "next/headers"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

const DashboardLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />

			<SidebarInset className="overflow-auto">
				<div className="p-4 space-y-3">
					<SidebarTrigger />
					<main className="container mx-auto flex flex-1 flex-col justify-center gap-8">{children}</main>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}

export default DashboardLayout
