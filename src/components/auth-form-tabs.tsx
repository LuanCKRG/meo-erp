"use client"

import { RegisterPartnerForm } from "@/components/forms/register-partner-form"
import { SignInForm } from "@/components/forms/sign-in-form"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AuthFormTabs = () => {
	return (
		<Tabs defaultValue="signin" className="w-full max-w-md mx-auto">
			<TabsList className="grid grid-cols-2 w-full max-w-md">
				<TabsTrigger value="signin">Entrar</TabsTrigger>
				<TabsTrigger value="register">Cadastre-se</TabsTrigger>
			</TabsList>

			<TabsContent value="signin">
				<Card>
					<CardContent className="p-0">
						<SignInForm />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="register">
				<Card>
					<CardContent className="p-0">
						<RegisterPartnerForm />
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	)
}

export { AuthFormTabs }
