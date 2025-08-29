import Image from "next/image"
import Link from "next/link"

import { AuthFormTabs } from "@/components/auth-form-tabs"

const HomePage = () => {
	return (
		<div className="bg-gradient-to-br from-background to-primary/20 flex min-h-svh flex-col items-center  p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-md">
				<Image src="/logo.png" alt="MEO Ernegia" width={300} height={200} className="w-full" />
				<AuthFormTabs />
				<div className="text-muted-foreground mt-6 text-center text-xs text-balance">
					<p>
						Ao continuar, você concorda com nossos{" "}
						<Link href="#" className="underline underline-offset-4 hover:text-primary">
							Termos de Serviço
						</Link>{" "}
						e{" "}
						<Link href="#" className="underline underline-offset-4 hover:text-primary">
							Política de Privacidade
						</Link>
						.
					</p>
				</div>
			</div>
		</div>
	)
}

export default HomePage
