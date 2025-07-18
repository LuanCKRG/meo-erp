import Image from "next/image"

import { RegisterPartnerForm } from "@/components/forms/register-partner-form"

const RegisterPage = () => (
	<main className="flex min-h-screen flex-col items-center justify-center p-4">
		<div className="w-full max-w-2xl shadow-2xl shadow-primary/20">
			<Image className="mx-auto" src="/logo.png" alt="MEO Ernegia" width={300} height={200} />
			<p className="sr-only">MEO Ernegia</p>
			<p className="text-muted-foreground text-sm text-center">Siga os passos para se cadastrar como parceiro.</p>
			<RegisterPartnerForm />
		</div>
	</main>
)

export default RegisterPage
