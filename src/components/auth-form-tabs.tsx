"use client"

import { SignInForm } from "@/components/forms/sign-in-form"
import { RegisterCustomerForm } from "@/components/forms/register-customer-form"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AuthFormTabs = () => {
	return (
		<Tabs defaultValue="signin" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="signin">Entrar</TabsTrigger>
				<TabsTrigger value="signup">Criar Conta</TabsTrigger>
			</TabsList>

			<TabsContent value="signin">
				<Card>
					<CardContent className="p-0">
						<SignInForm />
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="signup">
				<Card>
					<CardContent className="p-0">
						<RegisterCustomerForm />
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	)
}

export { AuthFormTabs }
