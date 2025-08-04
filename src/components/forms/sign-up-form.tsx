"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createUser } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type SignUpData, signUpSchema } from "@/lib/validations/auth/sign-up"

const SignUpForm = () => {
	const [isPending, startTransition] = useTransition()
	const queryClient = useQueryClient()

	const form = useForm<SignUpData>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: ""
		}
	})

	function onSubmit(data: SignUpData) {
		startTransition(async () => {
			const result = await createUser({
				email: data.email,
				password: data.password,
				role: "partner"
			})

			if (result.success) {
				toast.success("Conta criada com sucesso!", {
					description: "Você já pode fazer login com suas novas credenciais."
				})
				queryClient.invalidateQueries({ queryKey: ["users"] })
				form.reset()
				// Idealmente, a aba de login deveria ser ativada aqui.
				// O usuário será notificado e pode trocar de aba.
			} else {
				toast.error("Erro no Cadastro", {
					description: result.message
				})
			}
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
				<div className="flex flex-col gap-6">
					<div className="flex flex-col items-center text-center">
						<h1 className="text-2xl font-bold">Crie sua Conta</h1>
						<p className="text-muted-foreground text-balance">Preencha os campos para se registrar como parceiro.</p>
					</div>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nome Completo</FormLabel>
								<FormControl>
									<Input placeholder="João da Silva" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="email@exemplo.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Senha</FormLabel>
								<FormControl>
									<Input type="password" placeholder="********" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirmar Senha</FormLabel>
								<FormControl>
									<Input type="password" placeholder="********" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? "Criando conta..." : "Criar Conta"}
					</Button>
				</div>
			</form>
		</Form>
	)
}

export { SignUpForm }
