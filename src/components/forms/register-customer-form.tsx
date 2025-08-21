"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { registerCustomer } from "@/actions/customers"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type RegisterCustomerData, registerCustomerSchema } from "@/lib/validations/customer"

const RegisterCustomerForm = () => {
	const [isPending, startTransition] = useTransition()
	const queryClient = useQueryClient()

	const form = useForm<RegisterCustomerData>({
		resolver: zodResolver(registerCustomerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: ""
		}
	})

	function onSubmit(data: RegisterCustomerData) {
		startTransition(async () => {
			const result = await registerCustomer(data)

			if (result.success) {
				toast.success("Conta criada com sucesso!", {
					description: "Você já pode fazer login com suas novas credenciais."
				})
				queryClient.invalidateQueries({ queryKey: ["users"] }) // Pode ser ajustado para 'customers' se necessário
				form.reset()
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
						<h1 className="text-2xl font-bold">Crie sua Conta de Cliente</h1>
						<p className="text-muted-foreground text-balance">Preencha os campos para se registrar.</p>
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

export { RegisterCustomerForm }
