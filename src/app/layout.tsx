import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/providers/query-provider"

import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"]
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"]
})

export const metadata: Metadata = {
	title: "MEO Leasing",
	description: ""
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="pt-BR">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<QueryProvider>
					{children}
					<Toaster richColors />
				</QueryProvider>
			</body>
		</html>
	)
}
